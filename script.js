// Initialize Data
const defaultRooms = [
    {
        id: 1,
        owner: "Ravi Kumar",
        phone: "9848012345",
        location: "Vizianagaram - Cantonment",
        price: 5500,
        type: "Single Room",
        image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
        facilities: ["WiFi", "Attached Bathroom", "Fan"],
        restrictions: ["No Smoking"],
        description: "Quiet room near the railway station, perfect for students."
    },
    {
        id: 2,
        owner: "Lakshmi Devi",
        phone: "9123443210",
        location: "Vizianagaram - Fort City",
        price: 4000,
        type: "PG",
        image: "fort-city.png",
        facilities: ["Home Food", "WiFi", "Daily Cleaning"],
        restrictions: ["No Drinking"],
        description: "Safe and secure PG for women with home-cooked meals."
    },
    {
        id: 3,
        owner: "Suresh Babu",
        phone: "9000888777",
        location: "Visakhapatnam - MVP Colony",
        price: 7000,
        type: "Hostel",
        image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
        facilities: ["AC", "Bed", "Locker"],
        restrictions: ["No Bachelors"],
        description: "Premium sharing hostel with air conditioning."
    }
];

// Load rooms from localStorage or use defaults
function getRooms() {
    let roomsData = localStorage.getItem('vzm_rooms');
    
    if (roomsData) {
        let rooms = JSON.parse(roomsData);
        // Data Migration: Update old Unsplash logos to new local assets
        let updated = false;
        rooms = rooms.map(room => {
            if (room.location === "Vizianagaram - Fort City" && room.image.includes("unsplash.com/photo-1555854811-664f7621867c")) {
                room.image = "fort-city.png";
                updated = true;
            }
            return room;
        });
        if (updated) localStorage.setItem('vzm_rooms', JSON.stringify(rooms));
        return rooms;
    } else {
        localStorage.setItem('vzm_rooms', JSON.stringify(defaultRooms));
        return defaultRooms;
    }
}

// Save a new room
function addRoom(room) {
    const rooms = getRooms();
    room.id = Date.now();
    rooms.push(room);
    localStorage.setItem('vzm_rooms', JSON.stringify(rooms));
}

// Display Rooms Function (used in find.html)
function displayRooms(filteredRooms) {
    const container = document.getElementById('roomsContainer');
    if (!container) return;

    container.innerHTML = '';
    const items = (filteredRooms || getRooms()).filter(room => {
        const blocks = JSON.parse(localStorage.getItem('vzm_owner_blocks') || '{}');
        return (blocks[room.phone] || 0) < 5;
    });

    if (items.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="card border-0 bg-transparent">
                    <div class="card-body">
                        <i class="bi bi-shield-exclamation" style="font-size: 3rem; color: #cbd5e1;"></i>
                        <h3 class="mt-3 text-muted">No rooms found.</h3>
                        <p class="text-secondary">Some listings may have been removed due to community reports.</p>
                        <button class="btn btn-primary mt-2" onclick="resetFilters()">View Available Rooms</button>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    items.forEach(room => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 animate-up';
        card.innerHTML = `
            <div class="room-card card h-100 border-0 shadow-sm">
                <img src="${room.image}" alt="${room.location}" class="card-img-top">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="room-type">${room.type}</span>
                        <span class="price-tag">₹${room.price}</span>
                    </div>
                    <h5 class="card-title fw-bold"><i class="bi bi-geo-alt-fill me-1 text-primary"></i>${room.location}</h5>
                    <div class="mb-3 mt-3">
                        <p class="mb-1 fw-semibold small">Facilities:</p>
                        <div class="d-flex flex-wrap">
                            ${room.facilities.map(f => `<span class="badge-facility">${f}</span>`).join('')}
                        </div>
                    </div>
                    <div class="mb-4">
                        <p class="mb-1 fw-semibold small">Restrictions:</p>
                        <div class="d-flex flex-wrap">
                            ${room.restrictions.map(r => `<span class="badge-restriction">${r}</span>`).join('')}
                        </div>
                    </div>
                    <div class="d-grid gap-2">
                        <button class="btn btn-primary" onclick="contactOwner('${room.owner}', '${room.phone}', '${room.location}')">
                            <i class="bi bi-chat-right-text-fill me-2"></i>Send Message
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="blockOwner('${room.phone}', '${room.owner}')">
                            <i class="bi bi-slash-circle me-1"></i>Report & Block Owner
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function blockOwner(phone, name) {
    if (confirm(`Are you sure you want to report and block ${name}? If 5 people report this owner, their listings will be removed from the platform.`)) {
        const blocks = JSON.parse(localStorage.getItem('vzm_owner_blocks') || '{}');
        blocks[phone] = (blocks[phone] || 0) + 1;
        localStorage.setItem('vzm_owner_blocks', JSON.stringify(blocks));
        
        if (blocks[phone] >= 5) {
            alert(`Owner ${name} has been reported 5 times and their properties have been removed for community safety.`);
        } else {
            alert(`Owner reported successfully. (${blocks[phone]}/5 reports)`);
        }
        applyFilters(); // Refresh the list
    }
}


// Filter Logic
function applyFilters() {
    const locInput = document.getElementById('searchLocation');
    const priInput = document.getElementById('filterPrice');
    const typInput = document.getElementById('filterType');

    const location = locInput ? locInput.value.toLowerCase().trim() : '';
    const maxPrice = priInput ? priInput.value : '';
    const type = typInput ? typInput.value : '';
    
    const smokes = document.getElementById('prefSmoke')?.checked;
    const drinks = document.getElementById('prefDrink')?.checked;
    const hasPet = document.getElementById('prefPet')?.checked;
    const isBachelor = document.getElementById('prefBachelor')?.checked;
    const lateEntry = document.getElementById('prefLate')?.checked;

    let allRooms = getRooms();

    const filtered = allRooms.filter(room => {
        const matchLocation = room.location.toLowerCase().includes(location);
        const matchPrice = !maxPrice || room.price <= parseInt(maxPrice);
        const matchType = !type || room.type === type;
        
        if (smokes && room.restrictions.includes("No Smoking")) return false;
        if (drinks && room.restrictions.includes("No Drinking")) return false;
        if (hasPet && room.restrictions.includes("No Pets")) return false;
        if (isBachelor && room.restrictions.includes("No Bachelors")) return false;
        if (lateEntry && room.restrictions.includes("No Late Night Entry")) return false;

        return matchLocation && matchPrice && matchType;
    });

    displayRooms(filtered);
}

function resetFilters() {
    const loc = document.getElementById('searchLocation');
    const pri = document.getElementById('filterPrice');
    const typ = document.getElementById('filterType');
    
    if(loc) loc.value = '';
    if(pri) pri.value = '';
    if(typ) typ.value = '';
    
    // Reset checkboxes
    ['prefSmoke', 'prefDrink', 'prefPet', 'prefBachelor', 'prefLate'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.checked = false;
    });

    displayRooms(getRooms());
}

function contactOwner(name, phone, location) {
    // Populate hidden fields if modal exists
    const modal = document.getElementById('messageModal');
    if (modal) {
        document.getElementById('msgOwnerName').value = name;
        document.getElementById('msgRoomLocation').value = location;
        const msgModal = new bootstrap.Modal(modal);
        msgModal.show();
    } else {
        alert(`Inquiry sent to ${name} (${location})\nPhone: ${phone}`);
    }
}

// Role Management
function toggleRole() {
    const currentRole = localStorage.getItem('vzm_role') || 'user';
    
    if (currentRole === 'user') {
        const password = prompt('Enter Owner Passcode to access restricted features (Default: owner123):');
        if (password === 'owner123') {
            localStorage.setItem('vzm_role', 'owner');
            updateNavbarUI();
            alert('Switched to OWNER Mode. Access granted to Inbox and Listing tools.');
            window.location.href = 'messages.html';
        } else if (password !== null) {
            alert('Incorrect passcode. Access denied.');
        }
    } else {
        localStorage.setItem('vzm_role', 'user');
        updateNavbarUI();
        alert('Switched to USER Mode. Restricted features hidden.');
        window.location.href = 'index.html';
    }
}

// Handle Visitor Count
function handleVisitorCount() {
    let count = localStorage.getItem('vzm_visit_count');
    if (count === null) {
        count = 0;
    } else {
        count = parseInt(count);
    }
    
    // Exact count - increment once per page load
    count++;
    localStorage.setItem('vzm_visit_count', count);
    
    const countDisplays = document.querySelectorAll('.visitor-count-num');
    countDisplays.forEach(el => {
        el.innerText = count.toLocaleString();
    });
}

function updateNavbarUI() {
    const role = localStorage.getItem('vzm_role') || 'user';
    const ownerItems = document.querySelectorAll('.owner-only');
    const userItems = document.querySelectorAll('.user-only');
    const toggleBtn = document.getElementById('roleToggle');
    const indicator = document.getElementById('roleIndicator');

    if (role === 'owner') {
        ownerItems.forEach(el => el.classList.remove('d-none'));
        userItems.forEach(el => el.classList.add('d-none'));
        if(toggleBtn) toggleBtn.innerHTML = '<i class="bi bi-arrow-left-right me-1"></i> Switch to User';
        if(toggleBtn) {
            toggleBtn.classList.remove('btn-primary');
            toggleBtn.classList.add('btn-dark');
        }
        if(indicator) {
            indicator.innerHTML = '<i class="bi bi-person-workspace me-1"></i> OWNER MODE';
            indicator.className = 'badge rounded-pill bg-dark text-white px-3 py-2 fw-bold shadow-sm';
        }
        
        if (window.location.pathname.includes('my-inquiries.html')) {
            window.location.href = 'messages.html';
        }
    } else {
        ownerItems.forEach(el => el.classList.add('d-none'));
        userItems.forEach(el => el.classList.remove('d-none'));
        if(toggleBtn) toggleBtn.innerHTML = '<i class="bi bi-arrow-left-right me-1"></i> Switch to Owner';
        if(toggleBtn) {
            toggleBtn.classList.remove('btn-dark');
            toggleBtn.classList.add('btn-primary');
        }
        if(indicator) {
            indicator.innerHTML = '<i class="bi bi-person-circle me-1"></i> USER MODE';
            indicator.className = 'badge rounded-pill bg-light text-primary border px-3 py-2 fw-bold';
        }

        if (window.location.pathname.includes('messages.html') || window.location.pathname.includes('add.html')) {
            window.location.href = 'index.html';
        }
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    updateNavbarUI();
    handleVisitorCount();
    
    // Handle Message Form Submission
    const messageForm = document.getElementById('ownerMessageForm');
    if (messageForm) {
        messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const messageData = {
                id: Date.now(),
                to: document.getElementById('msgOwnerName').value,
                room: document.getElementById('msgRoomLocation').value,
                from: document.getElementById('senderName').value,
                phone: document.getElementById('senderPhone').value,
                text: document.getElementById('senderMessage').value,
                date: new Date().toLocaleString()
            };

            const messages = JSON.parse(localStorage.getItem('vzm_inquiries') || '[]');
            messages.push(messageData);
            localStorage.setItem('vzm_inquiries', JSON.stringify(messages));

            const modalEl = document.getElementById('messageModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            modalInstance.hide();
            
            alert(`Thanks ${messageData.from}! Your message has been sent to the owner of the ${messageData.room} property.`);
            messageForm.reset();
        });
    }

    // If on find.html page
    if (document.getElementById('roomsContainer')) {
        const urlParams = new URLSearchParams(window.location.search);
        const loc = urlParams.get('loc');
        const pri = urlParams.get('price');
        const typ = urlParams.get('type');

        if (loc || pri || typ) {
            document.getElementById('searchLocation').value = loc || '';
            document.getElementById('filterPrice').value = pri || '';
            document.getElementById('filterType').value = typ || '';
            applyFilters();
        } else {
            displayRooms(getRooms());
        }
    }

    // Handle Add Room Form
    const addRoomForm = document.getElementById('addRoomForm');
    if (addRoomForm) {
        addRoomForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const selectedRestrictions = [];
            document.querySelectorAll('input[name="restrictions"]:checked').forEach(cb => {
                selectedRestrictions.push(cb.value);
            });

            const newRoom = {
                owner: document.getElementById('ownerName').value,
                phone: document.getElementById('phoneNumber').value,
                location: document.getElementById('location').value,
                price: parseInt(document.getElementById('price').value),
                type: document.getElementById('roomType').value,
                image: document.getElementById('imageUrl').value || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
                facilities: document.getElementById('description').value.split(',').map(f => f.trim()),
                restrictions: selectedRestrictions,
                description: document.getElementById('description').value
            };

            addRoom(newRoom);
            alert('Room Added Successfully!');
            window.location.href = 'find.html';
        });
    }
});
