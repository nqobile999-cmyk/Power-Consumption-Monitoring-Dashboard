// ===== SUPABASE CONFIGURATION =====
// Energy Monitoring Dashboard - Supabase Client

// Configuration - UPDATE THESE WITH YOUR SUPABASE PROJECT CREDENTIALS
const SUPABASE_CONFIG = {
    URL: 'https://your-project-id.supabase.co',
    ANON_KEY: 'your-anon-key-here'
};

// Initialize Supabase client
let supabaseClient = null;

function initSupabase() {
    try {
        if (typeof supabase !== 'undefined') {
            supabaseClient = supabase.createClient(
                SUPABASE_CONFIG.URL,
                SUPABASE_CONFIG.ANON_KEY
            );
            console.log('✅ Supabase initialized successfully');
            return true;
        } else {
            console.warn('⚠️ Supabase library not loaded yet');
            return false;
        }
    } catch (error) {
        console.error('❌ Supabase initialization failed:', error);
        return false;
    }
}

// ===== DATABASE FUNCTIONS =====

// Save energy reading to database
async function saveEnergyReading(readingData) {
    if (!supabaseClient) {
        console.warn('Supabase not initialized');
        return null;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('energy_readings')
            .insert([readingData]);
            
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error saving reading:', error);
        return null;
    }
}

// Get user's energy readings
async function getUserReadings(userId, limit = 100) {
    if (!supabaseClient) {
        console.warn('Supabase not initialized');
        return [];
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('energy_readings')
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false })
            .limit(limit);
            
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching readings:', error);
        return [];
    }
}

// Save user settings
async function saveUserSettings(userId, settings) {
    if (!supabaseClient) return null;
    
    try {
        const { data, error } = await supabaseClient
            .from('user_settings')
            .upsert({
                user_id: userId,
                ...settings,
                updated_at: new Date().toISOString()
            });
            
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error saving settings:', error);
        return null;
    }
}

// ===== AUTHENTICATION FUNCTIONS =====
async function signUp(email, password) {
    if (!supabaseClient) return null;
    
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password
        });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Sign up error:', error);
        return null;
    }
}

async function signIn(email, password) {
    if (!supabaseClient) return null;
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Sign in error:', error);
        return null;
    }
}

async function signOut() {
    if (!supabaseClient) return null;
    
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Sign out error:', error);
        return false;
    }
}

// ===== REAL-TIME SUBSCRIPTIONS =====
function subscribeToReadings(userId, callback) {
    if (!supabaseClient) return null;
    
    const subscription = supabaseClient
        .channel('energy-readings')
        .on('postgres_changes', 
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'energy_readings',
                filter: `user_id=eq.${userId}`
            }, 
            (payload) => {
                if (callback && typeof callback === 'function') {
                    callback(payload.new);
                }
            }
        )
        .subscribe();
        
    return subscription;
}

// ===== EXPORT FUNCTIONS =====
// Make functions available globally
window.EnergyDB = {
    // Configuration
    init: initSupabase,
    config: SUPABASE_CONFIG,
    
    // Database operations
    saveReading: saveEnergyReading,
    getReadings: getUserReadings,
    saveSettings: saveUserSettings,
    
    // Authentication
    signUp: signUp,
    signIn: signIn,
    signOut: signOut,
    
    // Real-time
    subscribe: subscribeToReadings,
    
    // Client instance
    client: () => supabaseClient
};

// Auto-initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Try to initialize Supabase
    const initialized = initSupabase();
    
    if (initialized) {
        console.log('🚀 Supabase ready for energy monitoring');
        
        // Check for existing session
        supabaseClient.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                console.log('User authenticated:', session.user.email);
                window.userSession = session;
            }
        });
    }
});
        
