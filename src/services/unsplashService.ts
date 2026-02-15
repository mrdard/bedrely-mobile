/**
 * Unsplash API Service
 *
 * Free tier: 50 requests/hour
 * License: Unsplash License (free to use, attribution required)
 * https://unsplash.com/developers
 */

// Demo/Public Access Key - Replace with your own from https://unsplash.com/oauth/applications
const UNSPLASH_ACCESS_KEY = 'demo-access-key';
const UNSPLASH_API_URL = 'https://api.unsplash.com';

export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
  };
  links: {
    html: string;
  };
}

/**
 * Search for fitness/gym images on Unsplash
 */
export const searchFitnessImages = async (
  query: string = 'gym workout',
  page: number = 1,
  perPage: number = 10
): Promise<UnsplashImage[]> => {
  try {
    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=portrait&color=black_and_white`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching Unsplash images:', error);
    return [];
  }
};

/**
 * Get a random fitness image from Unsplash
 */
export const getRandomFitnessImage = async (
  query: string = 'gym workout'
): Promise<UnsplashImage | null> => {
  try {
    const response = await fetch(
      `${UNSPLASH_API_URL}/photos/random?query=${encodeURIComponent(query)}&orientation=portrait&color=black_and_white`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching random Unsplash image:', error);
    return null;
  }
};

/**
 * Trigger download tracking for Unsplash (required by their license)
 * Call this when an image is displayed to the user
 */
export const trackImageDownload = async (downloadUrl: string): Promise<void> => {
  try {
    await fetch(downloadUrl);
  } catch (error) {
    console.error('Error tracking Unsplash download:', error);
  }
};

/**
 * Get attribution text for Unsplash image
 */
export const getAttributionText = (image: UnsplashImage): string => {
  return `Photo by ${image.user.name} on Unsplash`;
};

/**
 * Get attribution URL for Unsplash image
 */
export const getAttributionUrl = (image: UnsplashImage): string => {
  return `${image.links.html}?utm_source=BedrelyMobile&utm_medium=referral`;
};

// Fallback placeholder images (public domain, free to use) - multiple per category
export const getFallbackImage = (categoryId: string, index: number = 0): string => {
  // Use placeholder images as fallback - 5 images per category that cycle
  const fallbacks: Record<string, string[]> = {
    AMRAP: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=600&fit=crop',
    ],
    EMOM: [
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=600&fit=crop',
    ],
    ForTime: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=600&fit=crop',
    ],
    Strength: [
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1521805103424-d8f8430e8933?w=400&h=600&fit=crop',
    ],
    Cardio: [
      'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1483721310020-03333e577078?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1486218119243-13883505764c?w=400&h=600&fit=crop',
    ],
    HIIT: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1550345332-09e3ac987658?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=600&fit=crop',
    ],
    Mobility: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1591228127791-8e2eaef098d3?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?w=400&h=600&fit=crop',
    ],
    Yoga: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1593810451137-5dc55105dace?w=400&h=600&fit=crop',
    ],
    Recovery: [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1591228127791-8e2eaef098d3?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=400&h=600&fit=crop',
    ],
  };

  const categoryImages = fallbacks[categoryId] || fallbacks.AMRAP;
  return categoryImages[index % categoryImages.length];
};
