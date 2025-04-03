// Mock API for localStorage operations
const API = {
    // Generic CRUD operations
    async create(collection, data) {
        const items = JSON.parse(localStorage.getItem(collection)) || [];
        const newItem = { ...data, id: Date.now().toString() };
        items.push(newItem);
        localStorage.setItem(collection, JSON.stringify(items));
        return newItem;
    },

    async read(collection, id = null) {
        const items = JSON.parse(localStorage.getItem(collection)) || [];
        if (id) {
            return items.find(item => item.id === id);
        }
        return items;
    },

    async update(collection, id, data) {
        let items = JSON.parse(localStorage.getItem(collection)) || [];
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...data };
            localStorage.setItem(collection, JSON.stringify(items));
            return items[index];
        }
        return null;
    },

    async delete(collection, id) {
        let items = JSON.parse(localStorage.getItem(collection)) || [];
        items = items.filter(item => item.id !== id);
        localStorage.setItem(collection, JSON.stringify(items));
        return true;
    },

    // Specific module operations
    // Driver Management
    async getActiveDrivers() {
        const drivers = await this.read('drivers');
        return drivers.filter(d => d.status === 'active');
    },

    // Fleet Management
    async getAvailableVehicles() {
        const vehicles = await this.read('vehicles');
        return vehicles.filter(v => v.status === 'available');
    },

    // Agent Model
    async calculateCommission(agentId, startDate, endDate) {
        const bookings = await this.read('bookings');
        const agentBookings = bookings.filter(b => 
            b.agentId === agentId && 
            new Date(b.createdAt) >= new Date(startDate) && 
            new Date(b.createdAt) <= new Date(endDate)
        );
        
        return agentBookings.reduce((total, booking) => {
            return total + (booking.amount * (booking.commissionRate || 0.15));
        }, 0);
    },

    // Booking System
    async createBooking(bookingData) {
        const booking = await this.create('bookings', {
            ...bookingData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            bookingId: `TRP-${Math.floor(1000 + Math.random() * 9000)}`
        });
        
        // Notify driver if assigned
        if (booking.driverId) {
            this.createNotification({
                userId: booking.driverId,
                type: 'new_booking',
                message: `New booking assigned: ${booking.bookingId}`,
                read: false
            });
        }
        
        return booking;
    },

    // Notification system
    async createNotification(notification) {
        return this.create('notifications', {
            ...notification,
            createdAt: new Date().toISOString()
        });
    },

    // Initialize sample data
    initSampleData() {
        if (!localStorage.getItem('initialized')) {
            // Sample drivers
            localStorage.setItem('drivers', JSON.stringify([
                { id: '1', name: 'John Doe', license: 'DL12345', status: 'active', vehicleId: '101' },
                { id: '2', name: 'Jane Smith', license: 'DL67890', status: 'active', vehicleId: '102' },
                { id: '3', name: 'Mike Johnson', license: 'DL54321', status: 'inactive', vehicleId: null }
            ]));

            // Sample vehicles
            localStorage.setItem('vehicles', JSON.stringify([
                { id: '101', make: 'Toyota', model: 'Camry', year: 2020, status: 'available', lastService: '2023-05-15' },
                { id: '102', make: 'Honda', model: 'Accord', year: 2021, status: 'available', lastService: '2023-06-20' },
                { id: '103', make: 'Ford', model: 'Transit', year: 2019, status: 'maintenance', lastService: '2023-07-10' }
            ]));

            // Sample agents
            localStorage.setItem('agents', JSON.stringify([
                { id: 'a1', name: 'Travel Plus', commissionRate: 0.15, contact: 'contact@travelplus.com' },
                { id: 'a2', name: 'City Tours', commissionRate: 0.20, contact: 'info@citytours.com' }
            ]));

            // Sample users
            localStorage.setItem('users', JSON.stringify([
                { id: 'u1', username: 'admin', password: 'admin123', role: 'admin', name: 'System Admin' },
                { id: 'u2', username: 'agent1', password: 'agent123', role: 'agent', name: 'Travel Plus Agent', agentId: 'a1' },
                { id: 'u3', username: 'driver1', password: 'driver123', role: 'driver', name: 'John Doe', driverId: '1' }
            ]));

            localStorage.setItem('initialized', 'true');
        }
    }
};

// Initialize sample data on first load
API.initSampleData();