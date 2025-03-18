import { Client, Databases, Query } from 'appwrite';
import { databases } from '@/lib/appwrite';
import { ID } from 'appwrite';

const GUMROAD_CLIENT_ID = 'xuf2jXskKSwegJFQyL77V7OaV55XtCJNVZiEHe9NW-s';
const GUMROAD_CLIENT_SECRET = '-U9CoPYgAspHQiPU5JyuB87vnm9yHz0PVaY-s-H_qoA';
const REDIRECT_URI = 'https://www.eonfluxtech.com/auth/gumroad/callback';
const DATABASE_ID = '67d3fa9b00025dff9050';
const COLLECTION_ID = 'gumroad_connections';

export const getGumroadAuthUrl = (state: string) => {
  const encodedRedirectUri = encodeURIComponent(REDIRECT_URI);
  return `https://gumroad.com/oauth/authorize?client_id=${GUMROAD_CLIENT_ID}&redirect_uri=${encodedRedirectUri}&scope=edit_products&response_type=code&state=${state}`;
};

export const exchangeCodeForToken = async (code: string) => {
  const response = await fetch('https://api.gumroad.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: GUMROAD_CLIENT_ID,
      client_secret: GUMROAD_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to exchange code for token');
  }

  return response.json();
};

export const getGumroadUserInfo = async (accessToken: string) => {
  const response = await fetch('https://api.gumroad.com/v2/user', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch Gumroad user info');
  }

  return response.json();
};

export const saveGumroadConnection = async (
  userId: string,
  gumroadUserId: string,
  accessToken: string,
  gumroadEmail: string,
  gumroadName: string,
  gumroadUrl?: string
) => {
  try {
    // Check if connection already exists
    const existingConnections = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal('user_id', [userId])
      ]
    );

    if (existingConnections.documents.length > 0) {
      // Update existing connection
      const existingDoc = existingConnections.documents[0];
      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        existingDoc.$id,
        {
          access_token: accessToken,
          gumroad_user_id: gumroadUserId,
          gumroad_email: gumroadEmail,
          gumroad_name: gumroadName,
          gumroad_url: gumroadUrl || null,
          last_updated: new Date().toISOString(),
        }
      );
    }

    // Create new connection
    return await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        user_id: userId,
        gumroad_user_id: gumroadUserId,
        access_token: accessToken,
        gumroad_email: gumroadEmail,
        gumroad_name: gumroadName,
        gumroad_url: gumroadUrl || null,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error('Error saving Gumroad connection:', error);
    throw error;
  }
};

export const getGumroadConnection = async (userId: string) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal('user_id', [userId])
      ]
    );

    return response.documents[0] || null;
  } catch (error) {
    console.error('Error fetching Gumroad connection:', error);
    throw error;
  }
};

export const disconnectGumroad = async (userId: string) => {
  try {
    const connection = await getGumroadConnection(userId);
    if (connection) {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ID,
        connection.$id
      );
    }
  } catch (error) {
    console.error('Error disconnecting Gumroad:', error);
    throw error;
  }
};

interface GumroadProduct {
  id: string;
  name: string;
  preview_url: string;
  description: string;
  price: number;
  currency: string;
  formatted_price: string;
  url: string;
  thumbnail_url: string;
  published: boolean;
  custom_permalink?: string;
  custom_receipt?: string;
  custom_summary?: string;
  custom_fields?: any[];
  sales_count: number;
  sales_usd_cents: number;
}

interface GumroadProductsResponse {
  success: boolean;
  products: GumroadProduct[];
}

export const getGumroadProducts = async (): Promise<GumroadProduct[]> => {
  try {
    const API_KEY = 'ikbK-8N7sWm_77qW30fB8rFiaStsMaQ_czmyayErxHs';

    // Fetch products directly using the API key
    const response = await fetch('https://api.gumroad.com/v2/products', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch Gumroad products');
    }

    const data: GumroadProductsResponse = await response.json();
    
    // Filter out products that are not published
    return data.products.filter(product => product.published);
  } catch (error) {
    console.error('Error fetching Gumroad products:', error);
    throw error;
  }
};

export const getGumroadProduct = async (productId: string): Promise<GumroadProduct> => {
  try {
    const API_KEY = 'ikbK-8N7sWm_77qW30fB8rFiaStsMaQ_czmyayErxHs';

    // Fetch specific product using the API key
    const response = await fetch(`https://api.gumroad.com/v2/products/${productId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch Gumroad product');
    }

    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error('Error fetching Gumroad product:', error);
    throw error;
  }
}; 