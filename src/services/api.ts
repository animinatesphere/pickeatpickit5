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
  let query = supabase.from("menu_items").select("*");
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
  const fileName = `${vendorId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("menu-images")
    .upload(fileName, file);

  if (uploadError) {
    return { data: null, error: uploadError };
  }

  const { data: urlData } = supabase.storage
    .from("menu-images")
    .getPublicUrl(fileName);

  return { data: urlData.publicUrl, error: null };
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
      )
    `) // Notice the !order_items_menu_item_id_fkey added here
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

export const getUserById = async (id: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
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
export const getOrderDetails = async (orderId: string) => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        menu_items (*)
      )
    `,
    )
    .eq("id", orderId)
    .single();

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
