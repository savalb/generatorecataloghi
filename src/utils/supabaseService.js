/**
 * Supabase API Service Layer
 * Centralized database operations with proper error handling
 */

import { supabase } from '../supabaseClient';

// ==================== TENANTS ====================

/**
 * Get tenant profile by user ID
 */
export const getTenant = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Update tenant profile
 */
export const updateTenant = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

// ==================== PRODUCTS ====================

/**
 * Get all products for a tenant
 */
export const getProducts = async (tenantId) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Create a new product
 */
export const createProduct = async (productData) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Update a product
 */
export const updateProduct = async (productId, updates) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (productId) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (error) throw error;
    return { data: true, error: null };
  } catch (err) {
    return { data: false, error: err };
  }
};

// ==================== CATALOGS ====================

/**
 * Get all catalogs for a tenant
 */
export const getCatalogs = async (tenantId) => {
  try {
    const { data, error } = await supabase
      .from('catalogs')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Create a new catalog
 */
export const createCatalog = async (catalogData) => {
  try {
    const { data, error } = await supabase
      .from('catalogs')
      .insert([catalogData])
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Update a catalog
 */
export const updateCatalog = async (catalogId, updates) => {
  try {
    const { data, error } = await supabase
      .from('catalogs')
      .update(updates)
      .eq('id', catalogId)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Delete a catalog
 */
export const deleteCatalog = async (catalogId) => {
  try {
    const { error } = await supabase
      .from('catalogs')
      .delete()
      .eq('id', catalogId);
    
    if (error) throw error;
    return { data: true, error: null };
  } catch (err) {
    return { data: false, error: err };
  }
};

// ==================== CATALOG ITEMS ====================

/**
 * Get catalog items with product details
 */
export const getCatalogItems = async (catalogId) => {
  try {
    const { data, error } = await supabase
      .from('catalog_items')
      .select(`
        id,
        position,
        page_number,
        product_id,
        products (
          id,
          name,
          price,
          description,
          image_url,
          category
        )
      `)
      .eq('catalog_id', catalogId)
      .order('position', { ascending: true });
    
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Add a product to a catalog
 */
export const addCatalogItem = async (catalogId, productId, position, pageNumber = 1) => {
  try {
    const { data, error } = await supabase
      .from('catalog_items')
      .insert([{
        catalog_id: catalogId,
        product_id: productId,
        position,
        page_number: pageNumber
      }])
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Remove a product from a catalog
 */
export const removeCatalogItem = async (itemId) => {
  try {
    const { error } = await supabase
      .from('catalog_items')
      .delete()
      .eq('id', itemId);
    
    if (error) throw error;
    return { data: true, error: null };
  } catch (err) {
    return { data: false, error: err };
  }
};

/**
 * Update catalog item position
 */
export const updateCatalogItemPosition = async (itemId, position, pageNumber) => {
  try {
    const { data, error } = await supabase
      .from('catalog_items')
      .update({ position, page_number: pageNumber })
      .eq('id', itemId)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

// ==================== ANALYTICS ====================

/**
 * Track an analytics event
 */
export const trackEvent = async (tenantId, catalogId, eventType, metadata = {}) => {
  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .insert([{
        tenant_id: tenantId,
        catalog_id: catalogId,
        event_type: eventType,
        metadata
      }]);
    
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    // Don't block UX on analytics failures
    console.warn('Analytics tracking failed:', err);
    return { data: null, error: err };
  }
};

/**
 * Get analytics events for a tenant
 */
export const getAnalyticsEvents = async (tenantId, limit = 100) => {
  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Get analytics summary for a tenant
 */
export const getAnalyticsSummary = async (tenantId) => {
  try {
    const { data, error } = await supabase.rpc('get_analytics_summary', { tenant_id_param: tenantId });
    
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    // Fallback to manual aggregation if RPC doesn't exist
    const { data: events } = await getAnalyticsEvents(tenantId, 1000);
    
    if (events) {
      const summary = {
        totalViews: events.filter(e => e.event_type === 'view_catalog').length,
        totalClicks: events.filter(e => e.event_type === 'click_product').length,
        totalOrders: events.filter(e => e.event_type === 'click_whatsapp').length,
        estimatedRevenue: events
          .filter(e => e.event_type === 'click_whatsapp')
          .reduce((sum, e) => sum + (e.metadata?.total || e.metadata?.price || 0) * (e.metadata?.quantity || 1), 0)
      };
      return { data: summary, error: null };
    }
    
    return { data: null, error: err };
  }
};

// ==================== FLIPBOOK PUBLICATIONS ====================

/**
 * Create a flipbook publication
 */
export const createFlipbookPublication = async (catalogId, slug) => {
  try {
    const { data, error } = await supabase
      .from('flipbook_publications')
      .insert([{
        catalog_id: catalogId,
        slug
      }])
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Get flipbook publication by slug
 */
export const getFlipbookBySlug = async (slug) => {
  try {
    const { data, error } = await supabase
      .from('flipbook_publications')
      .select(`
        *,
        catalogs (
          *,
          tenants (
            business_name,
            brand_colors,
            logo_url,
            whatsapp_phone
          )
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Get flipbook publication by catalog ID
 */
export const getFlipbookByCatalogId = async (catalogId) => {
  try {
    const { data, error } = await supabase
      .from('flipbook_publications')
      .select('*')
      .eq('catalog_id', catalogId)
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

// ==================== STORAGE ====================

/**
 * Upload a file to Supabase Storage
 */
export const uploadFile = async (file, bucket = 'assets', pathPrefix = '') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${pathPrefix}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return { data: { publicUrl: data.publicUrl }, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Delete a file from Supabase Storage
 */
export const deleteFile = async (filePath, bucket = 'assets') => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    
    if (error) throw error;
    return { data: true, error: null };
  } catch (err) {
    return { data: false, error: err };
  }
};

export default {
  // Tenants
  getTenant,
  updateTenant,
  // Products
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  // Catalogs
  getCatalogs,
  createCatalog,
  updateCatalog,
  deleteCatalog,
  // Catalog Items
  getCatalogItems,
  addCatalogItem,
  removeCatalogItem,
  updateCatalogItemPosition,
  // Analytics
  trackEvent,
  getAnalyticsEvents,
  getAnalyticsSummary,
  // Flipbooks
  createFlipbookPublication,
  getFlipbookBySlug,
  getFlipbookByCatalogId,
  // Storage
  uploadFile,
  deleteFile
};
