import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/user';
import Ad from '@/models/ad';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');

    if (!role || (role !== 'user' && role !== 'employee' && role !== 'admin')) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    // Get users with their basic info
    const users = await User.find({ role: role })
      .select('-password')
      .lean();

    // Get ads for each user
    const usersWithAds = await Promise.all(
      users.map(async (user) => {
        const ads = await Ad.find({ userId: user._id })
          .select('title status createdAd mainCategory')
          .sort({ createdAd: -1 })
          .lean();

        return {
          ...user,
          ads: ads || [],
          adsCount: ads.length
        };
      })
    );

    return NextResponse.json(usersWithAds);
  } catch (error) {
    console.error('Error fetching users with ads:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}


export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const { userId, isBlocked } = await req.json();

    if (!userId || typeof isBlocked !== 'boolean') {
      return NextResponse.json(
        { error: 'userId and isBlocked (boolean) are required' },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isBlocked },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user block status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}