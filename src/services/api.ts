import { supabase } from "./authService"; // Import from your existing auth service

// MENU ITEMS
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const addMenuItem = async (menuData: any) => {
  const { data, error } = await supabase
    .from("menu_items")
    .insert([menuData])
    .select();
  return { data, error };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateMenuItem = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from("menu_items")
    .update(updates)
    .eq("id", id)
    .select();
  return { data, error };
};

export const deleteMenuItem = async (id: string) => {
  const { data, error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", id);
  return { data, error };
};

// Update getMenuItems to handle optional vendor filtering
export const getMenuItems = async (vendorId: string | null = null) => {
  let query = supabase
    .from("menu_items")
    .select(`
      *,
      vendor_profiles(business_name)
    `);
    
  if (vendorId) {
    query = query.eq("vendor_id", vendorId);
  }
  
  const { data, error } = await query;
  return { data, error };
};
// ORDERS
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createOrder = async (orderData: any, orderItems: any[]) => {
  // 1. Insert the main order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single();
  
  if (orderError) return { data: null, error: orderError };
  
  // 2. Insert the individual items linked to that order
  const itemsWithOrderId = orderItems.map(item => ({
    ...item,
    order_id: order.id
  }));
  
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsWithOrderId)
    .select();
  
  return { data: { order, items }, error: itemsError };
}

// Upload menu item image
export const uploadMenuImage = async (file: File, vendorId: string) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${vendorId}/${fileName}`; // Clear path structure

  // Upload file
  const { error: uploadError } = await supabase.storage
    .from("menu-images")
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return { data: null, error: uploadError };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("menu-images")
    .getPublicUrl(filePath);

  return { data: urlData.publicUrl, error: null };
};

// Add these to your existing api.ts

// Fetch all users from all three tables
export const getAllSystemUsers = async () => {
  // Fetch Clients
  const { data: clients } = await supabase.from('users').select('*');
  // Fetch Vendors
  const { data: vendors } = await supabase.from('vendors').select('*');
  // Fetch Riders
  const { data: riders } = await supabase.from('riders').select('*');

  // Combine and format for the UI
  const combined = [
    ...(clients || []).map(u => ({ ...u, type: 'Client', name: `${u.firstname} ${u.lastname}` })),
    ...(vendors || []).map(v => ({ ...v, type: 'Vendor', name: v.business_name || v.firstname })),
    ...(riders || []).map(r => ({ ...r, type: 'Rider', name: `${r.firstname} ${r.lastname}` }))
  ];

  return combined;
};
// src/services/api.ts

export const riderAcceptOrder = async (orderId: string, riderId: string) => {
  const { data, error } = await supabase
    .from("orders")
    .update({ 
      status: "accepted", 
      rider_id: riderId 
    })
    .eq("id", orderId)
    .select();
    
  return { data, error };
};

export const riderRejectOrder = async (orderId: string) => {
  const { data, error } = await supabase
    .from("orders")
    .update({ 
      status: "canceled", 
      rider_id: null 
    })
    .eq("id", orderId)
    .select();
    
  return { data, error };
};


export const getAvailableDeliveries = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *, 
      vendor_profiles(
        business_address, 
        business_name, 
        business_phone
      ),
      order_items(
        quantity, 
        price_at_order, 
        menu_items(name, image_url)
      )
    `) 
    .eq("status", "preparing")
    .is("rider_id", null);
    
  return { data, error };
};
// Specifically for approving a Rider
export const updateRiderStatus = async (riderId: string, status: 'accepted' | 'rejected' | 'pending') => {
  const { data, error } = await supabase
    .from('riders')
    .update({ status })
    .eq('id', riderId)
    .select();
  return { data, error };
};

// Deactivate/Delete user (generic)
export const deleteUserFromSystem = async (id: string, type: string) => {
  const table = type === 'Client' ? 'users' : type === 'Vendor' ? 'vendors' : 'riders';
  const { error } = await supabase.from(table).delete().eq('id', id);
  return { error };
};
// src/services/api.ts
export const getVendorOrders = async (vendorId: string) => {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        menu_items!order_items_menu_item_id_fkey (*)
      ),
      riders!orders_rider_id_fkey (*)
    `)
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });
    
  return { data, error };
};
export const updateOrderStatus = async (orderId: string, status: string) => {
  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date() })
    .eq("id", orderId)
    .select();
  return { data, error };
};

// USER FUNCTIONS
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    return { data: null, error };
  }

  // Return first result or null
  return { data: data && data.length > 0 ? data[0] : null, error: null };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("user_id", userId)
    .select();
  return { data, error };
};

// src/services/api.ts

export const getUserById = async (id: string) => { // Make sure 'id' is here
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id) // This uses the 'id' from the argument above
    .maybeSingle();
    
  return { data, error };
};
// Create user profile if it doesn't exist
export const createUserProfileIfNotExists = async (
  userId: string,
  userEmail: string,
  userData?: Record<string, string>,
) => {
  try {
    // First check if profile exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", userId);

    if (checkError) {
      return { data: null, error: checkError };
    }

    // If user already exists, return the existing user
    if (existingUser && existingUser.length > 0) {
      return { data: existingUser[0], error: null };
    }

    // Create new user profile
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert([
        {
          user_id: userId,
          email: userEmail,
          firstname: userData?.firstname || userData?.first_name || "",
          lastname: userData?.lastname || userData?.last_name || "",
          phone: userData?.phone || "",
          address: userData?.address || "",
          zip: userData?.zip || "",
          city: userData?.city || "",
          state: userData?.state || "",
        },
      ])
      .select()
      .single();

    if (createError) {
      console.error("Error creating user profile:", createError);
      return { data: null, error: createError };
    }

    return { data: newUser, error: null };
  } catch (error) {
    console.error("Error in createUserProfileIfNotExists:", error);
    return { data: null, error };
  }
};

// Get user orders
export const getUserOrders = async (userId: string) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data, error };
};

// Get order details with items
// src/services/api.ts

export const getOrderDetails = async (orderId: string) => {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        menu_items (*)
      )
    `)
    .eq("id", orderId)
    .maybeSingle(); // <--- CHANGE THIS from .single()

  return { data, error };
};
// TRACKING
// Get real tracking updates for an order
export const getOrderTracking = async (orderId: string) => {
  const { data, error } = await supabase
    .from("order_status_updates")
    .select("*")
    .eq("order_id", orderId)
    .order("timestamp", { ascending: true });
  return { data, error };
};

// Add a tracking update to an order
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const addTrackingUpdate = async (orderId: string, trackingData: any) => {
  const { data, error } = await supabase
    .from("order_status_updates")
    .insert([{ order_id: orderId, ...trackingData }])
    .select();
  return { data, error };
};

// DASHBOARD STATS
export const getAdminStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Get Orders Stats
  const { data: orders } = await supabase.from('orders').select('status, total_amount, created_at');
  
  const stats = {
    activeOrders: orders?.filter(o => ['preparing', 'accepted', 'picked_up'].includes(o.status)).length || 0,
    completedOrders: orders?.filter(o => o.status === 'completed').length || 0,
    canceledOrders: orders?.filter(o => o.status === 'cancelled').length || 0,
    todayEarnings: orders?.filter(o => {
      const orderDate = new Date(o.created_at);
      return orderDate >= today && o.status === 'completed';
    }).reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
    pendingApprovals: 0
  };

  // 2. Get Pending Rider Approvals
  const { count: pendingRiders } = await supabase
    .from('riders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');
  
  stats.pendingApprovals = pendingRiders || 0;

  // 3. Get User Counts
  const { count: clients } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const { count: vendors } = await supabase.from('vendors').select('*', { count: 'exact', head: true });
  const { count: riders } = await supabase.from('riders').select('*', { count: 'exact', head: true });

  return {
    ...stats,
    userCounts: {
      clients: clients || 0,
      vendors: vendors || 0,
      riders: riders || 0,
      total: (clients || 0) + (vendors || 0) + (riders || 0)
    }
  };
};

// ADMIN - GET ALL ORDERS
export const getAllOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      users (firstname, lastname),
      vendors (business_name)
    `)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// ADMIN - GET DETAILED ORDER
export const getAdminOrderDetails = async (orderId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      users (firstname, lastname, email, phone, address, city, state),
      vendors (business_name, business_address, business_phone),
      riders (firstname, lastname, phone),
      order_items (
        id,
        quantity,
        price,
        menu_items (name)
      )
    `)
    .eq('id', orderId)
    .single();
  
  return { data, error };
};

// ADMIN - REVENUE ANALYTICS
export const getRevenueAnalytics = async (period: 'D' | 'W' | 'M' | 'Y') => {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case 'D': startDate.setDate(now.getDate() - 1); break;
    case 'W': startDate.setDate(now.getDate() - 7); break;
    case 'M': startDate.setDate(now.getDate() - 30); break;
    case 'Y': startDate.setDate(now.getDate() - 365); break;
  }

  const { data, error } = await supabase
    .from('orders')
    .select('total_amount, created_at, status')
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString());

  if (error) return { data: null, error };

  return { data, error: null };
};

// ADMIN - TOP USERS
export const getTopUsers = async (limit = 5) => {
  const { data, error } = await supabase
    .from('orders')
    .select('user_id, users(firstname, lastname)')
    .eq('status', 'completed');

  if (error) return { data: null, error };

  // Calculate order counts
  const counts: Record<string, any> = {};
  data.forEach(order => {
    const id = order.user_id;
    if (!counts[id]) {
      const user = order.users as any;
      counts[id] = { 
        name: user ? `${user.firstname} ${user.lastname}` : 'Unknown',
        orders: 0 
      };
    }
    counts[id].orders++;
  });

  return {
    data: Object.values(counts)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, limit),
    error: null
  };
};

// ADMIN - GET POPULAR ITEMS
export const getPopularItems = async (limit = 3) => {
  const { data, error } = await supabase
    .from('order_items')
    .select('menu_item_id, menu_items(name, category)')
    .order('created_at', { ascending: false });

  if (error) return { data: null, error };

  const counts: Record<string, any> = {};
  data.forEach(item => {
    const id = item.menu_item_id;
    if (!id) return;
    if (!counts[id]) {
      const menuItem = item.menu_items as any;
      counts[id] = { 
        name: menuItem?.name || 'Unknown',
        category: menuItem?.category || 'General',
        count: 0 
      };
    }
    counts[id].count++;
  });

  return {
    data: Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit),
    error: null
  };
};

// ADMIN - GET ALL TRANSACTIONS
export const getAllTransactions = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// ADMIN - GET PAYOUT REQUESTS
export const getPayoutRequests = async () => {
  const { data, error } = await supabase
    .from('payout_requests')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// ADMIN - UPDATE PAYOUT STATUS
export const updatePayoutStatus = async (payoutId: string, status: 'approved' | 'rejected' | 'successful') => {
  const { data, error } = await supabase
    .from('payout_requests')
    .update({ status, updated_at: new Date() })
    .eq('id', payoutId)
    .select();
  
  return { data, error };
};

// ADMIN - GET PLATFORM TOTALS
export const getPlatformTotals = async () => {
  const { data: orders } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('status', 'completed');
  
  const totalEarnings = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
  
  const { data: pendingPayouts } = await supabase
    .from('payout_requests')
    .select('amount')
    .eq('status', 'pending');
  
  const totalPendingPayouts = pendingPayouts?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  return { totalEarnings, totalPendingPayouts };
};

export const getRiderStats = async (riderId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: orders } = await supabase
    .from('orders')
    .select('status, total_amount, created_at')
    .eq('rider_id', riderId);

  const todayOrders = orders?.filter(o => {
    const orderDate = new Date(o.created_at);
    return orderDate >= today;
  }) || [];

  return {
    todayEarnings: todayOrders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.total_amount || 0), 0),
    todayOrdersCount: todayOrders.length,
    completedToday: todayOrders.filter(o => o.status === 'completed').length,
    inProgressToday: todayOrders.filter(o => ['accepted', 'picked_up'].includes(o.status)).length
  };
};

// ADMIN - GET USERS FOR RESTRICTION
export const getAdminUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      user_id,
      firstname,
      lastname,
      avatar_url
    `)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// ADMIN - GET VENDORS FOR RESTRICTION
export const getAdminVendors = async () => {
  const { data, error } = await supabase
    .from('vendors')
    .select(`
      id,
      business_name,
      avatar_url
    `)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// ADMIN - GET RIDERS FOR RESTRICTION
export const getAdminRiders = async () => {
  const { data, error } = await supabase
    .from('riders')
    .select(`
      id,
      firstname,
      lastname,
      avatar_url
    `)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// RIDER EARNINGS & TRANSACTIONS
export const getRiderTransactions = async (riderId: string) => {
  const { data, error } = await supabase
    .from("rider_transactions")
    .select("*")
    .eq("rider_id", riderId)
    .order("created_at", { ascending: false });
  return { data, error };
};

export const getRiderBankInfo = async (riderId: string) => {
  const { data, error } = await supabase
    .from("rider_bank_info")
    .select("*")
    .eq("rider_id", riderId)
    .maybeSingle();
  return { data, error };
};

export const saveRiderBankInfo = async (riderId: string, bankInfo: { bank_name: string, account_number: string, account_name: string }) => {
  const { data, error } = await supabase
    .from("rider_bank_info")
    .upsert({
      rider_id: riderId,
      ...bankInfo
    })
    .select();
  return { data, error };
};

export const getRiderEarningsHistory = async (riderId: string) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("rider_id", riderId)
    .eq("status", "completed")
    .order("created_at", { ascending: false });
  return { data, error };
};

// --- CHAT SYSTEM API ---

export const getConversations = async (userId: string) => {
  const { data, error } = await supabase
    .from("conversation_participants")
    .select(`
      conversation_id,
      conversations (
        id,
        updated_at,
        last_message_text,
        last_message_time,
        type,
        metadata
      )
    `)
    .eq("user_id", userId)
    .order("conversations(updated_at)", { ascending: false });
  return { data, error };
};

export const getConversationParticipants = async (conversationId: string) => {
  const { data, error } = await supabase
    .from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", conversationId);
  return { data, error };
};

export const getMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return { data, error };
};

export const sendMessage = async (conversationId: string, senderId: string, content: string, type: string = 'text', url?: string) => {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      type,
      url
    })
    .select()
    .single();
  return { data, error };
};

export const createConversation = async (participants: string[], type: string = 'direct', metadata: any = {}) => {
  // 1. Create conversation
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .insert({ type, metadata })
    .select()
    .single();

  if (convError) return { error: convError };

  // 2. Add participants
  const participantData = participants.map(userId => ({
    conversation_id: conversation.id,
    user_id: userId
  }));

  const { error: partError } = await supabase
    .from("conversation_participants")
    .insert(participantData);

  return { data: conversation, error: partError };
};

export const subscribeToMessages = (conversationId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      callback
    )
    .subscribe();
};
