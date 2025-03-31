import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/user';
import Ad from '@/models/ad';
import { getFromR2 } from '@/lib/r2';

export async function GET(req: NextRequest) {
  try {
      await dbConnect();

      const { searchParams } = new URL(req.url);
      const role = searchParams.get('role');
      const adStatus = searchParams.get('status');

      let userQuery = {};
      if (role && ['user', 'employee', 'admin'].includes(role)) {
          userQuery = { role };
      }

      const ads = await Ad.find(adStatus ? { status: adStatus } : {})
          .sort({ createdAt: -1 })
          .populate({
              path: 'userId',
              select: 'name email isBlocked phoneNumber role',
              match: userQuery,
              model: User 
          })
          .lean();

      const processedAds = await Promise.all(
          ads
              .filter(ad => ad.userId !== null && typeof ad.userId === 'object')
              .map(async (ad) => {
                  const userProfile = await User.findById(ad.userId._id).select("name profile");
                  
                  const extractKeyFromUrl = (url: string | URL) => {
                      try {
                          const urlObj = new URL(url);
                          const pathname = urlObj.pathname.slice(1);
                          const bucketName = process.env.R2_BUCKET_NAME;
                          return pathname.replace(`${bucketName}/`, "");
                      } catch (error) {
                          console.error("Invalid image URL:", url);
                          return null;
                      }
                  };
                  
                  const images = [];
                  if (ad.images && Array.isArray(ad.images)) {
                      for (const imageUrl of ad.images) {
                          const key = extractKeyFromUrl(imageUrl);
                          if (key) {
                              try {
                                  const imageBuffer = await getFromR2(key);
                                  images.push(`data:image/jpeg;base64,${imageBuffer.toString('base64')}`);
                              } catch (error) {
                                  console.error("Error fetching image from R2:", key);
                              }
                          }
                      }
                  }
                  
                  return {
                      _id: ad._id,
                      userId: ad.userId._id.toString(),
                      title: ad.title,
                      description: ad.description,
                      images: images.length > 0 ? images : ad.images || [],
                      location: ad.location,
                      address: ad.address,
                      city: ad.city,
                      state: ad.state,
                      pincode: ad.pincode,
                      mobile: ad.mobile,
                      mainCategory: ad.mainCategory,
                      subCategory: ad.subCategory,
                      subCategory2: ad.subCategory2,
                      status: ad.status,
                      createdAd: ad.createdAd,
                      updatedAd: ad.updatedAd,
                      showAllStates: ad.showAllStates,
                      user: {
                          name: userProfile?.name,
                          email:userProfile?.email,
                      }
                  };
              })
      );

      return NextResponse.json({
          ads: processedAds,
          count: processedAds.length
      });
  } catch (error) {
      console.error('Error fetching ads with users:', error);
      return NextResponse.json(
          { error: 'Internal Server Error' },
          { status: 500 }
      );
  }
}


// Update ad status
export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const { adId, status } = await req.json();

    if (!adId || !['pending', 'active', 'rejected', 'blocked'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid adId and status (pending|active|rejected|blocked) are required' },
        { status: 400 }
      );
    }

    const updatedAd = await Ad.findByIdAndUpdate(
      adId,
      { status },
      { new: true }
    ).populate({
      path: 'userId',
      select: 'name email'
    });

    if (!updatedAd) {
      return NextResponse.json(
        { error: 'Ad not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedAd);
  } catch (error) {
    console.error('Error updating ad status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}