import { dbHelpers } from './supabase';

// Demo product data
const demoProducts = [
  {
    name: "Vintage Nike Air Jordan 1",
    description: "Classic 1985 release in excellent condition. Original box included.",
    category: "Clothing",
    listing_price: 450.00,
    purchase_price: 150.00,
    platform: "eBay",
    status: "sold",
    condition: "good",
    tags: ["vintage", "nike", "jordan", "sneakers", "collectible"],
    notes: "Sold within 3 days of listing. Great profit margin!"
  },
  {
    name: "iPhone 13 Pro Max 256GB",
    description: "Like new condition, no scratches or dents. Comes with original accessories.",
    category: "Electronics",
    listing_price: 850.00,
    purchase_price: 650.00,
    platform: "Facebook Marketplace",
    status: "listed",
    condition: "like_new",
    tags: ["iphone", "apple", "smartphone", "256gb"],
    notes: "High demand item, expecting quick sale"
  },
  {
    name: "Vintage Levi's 501 Jeans",
    description: "1990s vintage Levi's 501 in classic blue. Size 32x32.",
    category: "Clothing",
    listing_price: 120.00,
    purchase_price: 25.00,
    platform: "Depop",
    status: "sold",
    condition: "good",
    tags: ["vintage", "levis", "501", "jeans", "90s"],
    notes: "Vintage clothing is trending well"
  },
  {
    name: "MacBook Air M1 256GB",
    description: "Perfect condition, barely used. Still under Apple warranty.",
    category: "Electronics",
    listing_price: 750.00,
    purchase_price: 550.00,
    platform: "eBay",
    status: "pending",
    condition: "like_new",
    tags: ["macbook", "apple", "m1", "laptop"],
    notes: "Multiple interested buyers"
  },
  {
    name: "Vintage Polaroid Camera",
    description: "Working vintage Polaroid camera from the 1980s. Includes film.",
    category: "Electronics",
    listing_price: 180.00,
    purchase_price: 45.00,
    platform: "Etsy",
    status: "listed",
    condition: "fair",
    tags: ["vintage", "polaroid", "camera", "film", "80s"],
    notes: "Retro photography is very popular"
  },
  {
    name: "Nintendo Switch Console",
    description: "Barely used Nintendo Switch with 3 games included. Original box.",
    category: "Electronics",
    listing_price: 280.00,
    purchase_price: 200.00,
    platform: "OfferUp",
    status: "sold",
    condition: "like_new",
    tags: ["nintendo", "switch", "gaming", "console"],
    notes: "Gaming consoles always sell well"
  },
  {
    name: "Vintage Band T-Shirt - Nirvana",
    description: "Authentic 1990s Nirvana tour t-shirt. Size L. Rare find!",
    category: "Clothing",
    listing_price: 95.00,
    purchase_price: 15.00,
    platform: "Depop",
    status: "listed",
    condition: "good",
    tags: ["vintage", "nirvana", "tshirt", "90s", "band"],
    notes: "Band merch is always in demand"
  },
  {
    name: "Dyson V8 Vacuum Cleaner",
    description: "Excellent condition, fully functional. All attachments included.",
    category: "Home & Garden",
    listing_price: 220.00,
    purchase_price: 120.00,
    platform: "Facebook Marketplace",
    status: "sold",
    condition: "good",
    tags: ["dyson", "vacuum", "v8", "cleaning"],
    notes: "Home appliances sell quickly locally"
  },
  {
    name: "Vintage Vinyl Records Collection",
    description: "Collection of 20 classic rock vinyl records from the 70s-80s.",
    category: "Collectibles",
    listing_price: 350.00,
    purchase_price: 100.00,
    platform: "eBay",
    status: "listed",
    condition: "good",
    tags: ["vinyl", "records", "classic rock", "70s", "80s"],
    notes: "Vinyl collecting is making a comeback"
  },
  {
    name: "Apple Watch Series 7 45mm",
    description: "Perfect condition, no scratches. Includes sport band and charger.",
    category: "Electronics",
    listing_price: 320.00,
    purchase_price: 250.00,
    platform: "Mercari",
    status: "pending",
    condition: "like_new",
    tags: ["apple", "watch", "series7", "smartwatch"],
    notes: "Smartwatches are popular gift items"
  }
];

// Demo meeting data
const demoMeetings = [
  {
    title: "iPhone 13 Pro Max Pickup",
    client_name: "Sarah Johnson",
    client_email: "sarah.j@email.com",
    client_phone: "(555) 123-4567",
    scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    scheduled_time: "14:00",
    duration: 30,
    location: "Starbucks on Main St",
    meeting_type: "pickup",
    status: "scheduled",
    notes: "Client confirmed, bringing cash. Meeting at public location for safety."
  },
  {
    title: "MacBook Air Viewing",
    client_name: "Mike Chen",
    client_email: "mike.chen@email.com",
    client_phone: "(555) 987-6543",
    scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
    scheduled_time: "16:30",
    duration: 45,
    location: "Local coffee shop",
    meeting_type: "viewing",
    status: "scheduled",
    notes: "Potential buyer wants to test the laptop before purchasing."
  },
  {
    title: "Vintage Jeans Negotiation",
    client_name: "Emma Wilson",
    client_email: "emma.w@email.com",
    scheduled_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_time: "18:00",
    duration: 30,
    location: "My apartment",
    meeting_type: "negotiation",
    status: "scheduled",
    notes: "Client interested in multiple vintage items. Good opportunity for bundle deal."
  },
  {
    title: "Nintendo Switch Drop-off",
    client_name: "Alex Rodriguez",
    client_email: "alex.r@email.com",
    client_phone: "(555) 456-7890",
    scheduled_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_time: "12:00",
    duration: 20,
    location: "Client's workplace",
    meeting_type: "drop_off",
    status: "scheduled",
    notes: "Delivering to client's office during lunch break."
  },
  {
    title: "Dyson Vacuum Pickup",
    client_name: "Lisa Thompson",
    client_email: "lisa.t@email.com",
    client_phone: "(555) 234-5678",
    scheduled_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_time: "10:00",
    duration: 25,
    location: "Target parking lot",
    meeting_type: "pickup",
    status: "scheduled",
    notes: "Public meeting place for safety. Client confirmed availability."
  }
];

// Demo analytics data
const demoAnalytics = [
  {
    event_type: 'product_view',
    event_data: { product_id: 'demo-1', source: 'dashboard' },
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    event_type: 'product_created',
    event_data: { product_id: 'demo-2', category: 'Electronics' },
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    event_type: 'meeting_scheduled',
    event_data: { meeting_id: 'demo-1', type: 'pickup' },
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },
  {
    event_type: 'sale_completed',
    event_data: { product_id: 'demo-3', sale_price: 120.00, profit: 95.00 },
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  },
  {
    event_type: 'product_view',
    event_data: { product_id: 'demo-4', source: 'products_page' },
    created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
  }
];

export class DemoDataGenerator {
  static async generateDemoData(userId: string) {
    try {
      console.log('Generating demo data for user:', userId);

      // Create demo products
      const productPromises = demoProducts.map(async (product, index) => {
        const productData = {
          ...product,
          user_id: userId,
          created_at: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
          profit: product.status === 'sold' && product.listing_price && product.purchase_price 
            ? product.listing_price - product.purchase_price 
            : null,
          sold_price: product.status === 'sold' ? product.listing_price : null
        };

        const { data, error } = await dbHelpers.createProduct(productData);
        if (error) {
          console.error('Error creating demo product:', error);
          return null;
        }
        return data;
      });

      const createdProducts = await Promise.all(productPromises);
      console.log('Created demo products:', createdProducts.filter(p => p).length);

      // Create demo meetings
      const meetingPromises = demoMeetings.map(async (meeting, index) => {
        const meetingData = {
          ...meeting,
          user_id: userId,
          created_at: new Date(Date.now() - (index + 1) * 12 * 60 * 60 * 1000).toISOString()
        };

        // Associate some meetings with products
        if (index < createdProducts.length && createdProducts[index]) {
          meetingData.product_id = createdProducts[index]?.id;
        }

        const { data, error } = await dbHelpers.createMeeting(meetingData);
        if (error) {
          console.error('Error creating demo meeting:', error);
          return null;
        }
        return data;
      });

      const createdMeetings = await Promise.all(meetingPromises);
      console.log('Created demo meetings:', createdMeetings.filter(m => m).length);

      // Create demo analytics
      const analyticsPromises = demoAnalytics.map(async (analytics) => {
        const analyticsData = {
          ...analytics,
          user_id: userId
        };

        const { data, error } = await dbHelpers.createAnalytics(analyticsData);
        if (error) {
          console.error('Error creating demo analytics:', error);
          return null;
        }
        return data;
      });

      const createdAnalytics = await Promise.all(analyticsPromises);
      console.log('Created demo analytics:', createdAnalytics.filter(a => a).length);

      return {
        products: createdProducts.filter(p => p),
        meetings: createdMeetings.filter(m => m),
        analytics: createdAnalytics.filter(a => a)
      };

    } catch (error) {
      console.error('Error generating demo data:', error);
      throw error;
    }
  }

  static async checkDemoDataExists(userId: string): Promise<boolean> {
    try {
      const { data: products } = await dbHelpers.getProducts(userId);
      const { data: meetings } = await dbHelpers.getMeetings(userId);
      
      return (products && products.length > 0) || (meetings && meetings.length > 0);
    } catch (error) {
      console.error('Error checking demo data:', error);
      return false;
    }
  }

  static async cleanupDemoData(userId: string) {
    try {
      // Get all demo data for this user
      const { data: products } = await dbHelpers.getProducts(userId);
      const { data: meetings } = await dbHelpers.getMeetings(userId);
      const { data: analytics } = await dbHelpers.getAnalytics(userId);

      // Delete demo products
      if (products) {
        const deleteProductPromises = products.map(product => 
          dbHelpers.deleteProduct(product.id)
        );
        await Promise.all(deleteProductPromises);
      }

      // Delete demo meetings
      if (meetings) {
        const deleteMeetingPromises = meetings.map(meeting => 
          dbHelpers.deleteMeeting(meeting.id)
        );
        await Promise.all(deleteMeetingPromises);
      }

      // Delete demo analytics
      if (analytics) {
        const deleteAnalyticsPromises = analytics.map(analyticsItem => 
          dbHelpers.deleteAnalytics(analyticsItem.id)
        );
        await Promise.all(deleteAnalyticsPromises);
      }

      console.log('Demo data cleaned up for user:', userId);
    } catch (error) {
      console.error('Error cleaning up demo data:', error);
      throw error;
    }
  }
}