// app/api/contact/route.ts
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import Contact from '@/models/contact';
import connectDB from '@/lib/db';

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json();
    const { name, email, subject, message, ad_id } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Additional validation for scam/fraud reports
    if (subject.toLowerCase() === 'scam_or_fraud' && !ad_id) {
      return NextResponse.json(
        { success: false, message: 'Ad ID is required for scam/fraud reports' },
        { status: 400 }
      );
    }

    const contact = new Contact({
      name,
      email,
      subject,
      message,
      ...(ad_id && { ad_id }),
      status: 'pending',
      createdAt: new Date(),
    });

    await contact.save();

    return NextResponse.json(
      { 
        success: true,
        message: 'Contact form submitted successfully',
        data: {
          id: contact._id,
          name: contact.name,
          subject: contact.subject,
          status: contact.status,
          createdAt: contact.createdAt,
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error submitting contact form',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  await connectDB();

  try {
    // Fetch all contacts sorted by creation date (newest first)
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .select('-__v'); // Exclude version key

    return NextResponse.json({
      success: true,
      data: contacts,
      count: contacts.length
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error fetching contacts',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json();
    const { id, status, response } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'in_progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status value' },
        { status: 400 }
      );
    }

    const updateData: any = { 
      status,
      updatedAt: new Date() 
    };
    if (response) updateData.response = response;

    const contact = await Contact.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-__v');

    if (!contact) {
      return NextResponse.json(
        { success: false, message: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });

  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error updating contact',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Contact ID is required' },
        { status: 400 }
      );
    }

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return NextResponse.json(
        { success: false, message: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error deleting contact',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}