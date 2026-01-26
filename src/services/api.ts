import { supabase } from './authService' // Import from your existing auth service

// MENU ITEMS
export const addMenuItem = async (menuData: any) => {
  const { data, error } = await supabase
    .from('menu_items')
    .insert([menuData])
    .select()
  return { data, error }
}

export const updateMenuItem = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('menu_items')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

export const deleteMenuItem = async (id: string) => {
  const { data, error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id)
  return { data, error }
}

// Update getMenuItems to handle optional vendor filtering
export const getMenuItems = async (vendorId: string | null = null) => {
  let query = supabase.from('menu_items').select('*')
  if (vendorId) {
    query = query.eq('vendor_id', vendorId)
  }
  const { data, error } = await query
  return { data, error }
}
// ORDERS
export const createOrder = async (orderData: any, orderItems: any[]) => {
  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
  
  if (orderError) {
    console.error('Order creation error:', orderError);
    return { data: null, error: orderError };
  }
  
  // Add order items
  const itemsWithOrderId = orderItems.map(item => ({
    ...item,
    order_id: order[0].id
  }))
  
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsWithOrderId)
    .select()
  
  if (itemsError) {
    console.error('Order items error:', itemsError);
  }
  
  return { data: { order: order[0], items }, error: itemsError }
}

// Upload menu item image
export const uploadMenuImage = async (file: File, vendorId: string) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${vendorId}/${Date.now()}.${fileExt}`
  
  const { error: uploadError } = await supabase.storage
    .from('menu-images')
    .upload(fileName, file)
  
  if (uploadError) {
    return { data: null, error: uploadError }
  }
  
  const { data: urlData } = supabase.storage
    .from('menu-images')
    .getPublicUrl(fileName)
  
  return { data: urlData.publicUrl, error: null }
}
export const getVendorOrders = async (vendorId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        menu_items (*)
      )
    `)
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const updateOrderStatus = async (orderId: string, status: string) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date() })
    .eq('id', orderId)
    .select()
  return { data, error }
}