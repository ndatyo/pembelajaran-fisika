// Global variables
let currentUser = null;
let currentToken = '';
let tokenTimer = 30;
let tokenInterval = null;
let currentLocation = null;
let currentSelectedClass = '';

// Settings variables
let websiteSettings = {
    logo: '⚛️',
    logoType: 'emoji',
    logoImage: null,
    background: 'gradient-blue',
    backgroundType: 'gradient',
    backgroundImage: null,
    mainTitle: 'Fisika Learning',
    subTitle: 'Sistem Pembelajaran Fisika Digital',
    description: 'Platform pembelajaran modern untuk guru dan siswa'
};

// Initialize Supabase
const supabaseUrl = 'https://glqcpzrbxjvihumhckpd.supabase.co'; // Ganti dengan URL project Anda
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdscWNwenJieGp2aWh1bWhja3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzM2ODAsImV4cCI6MjA3NDY0OTY4MH0.7UlhRuTULC851RVc73liWhSxmKSSK3oweqVVo1Y6PBc'; // Ganti dengan anon key Anda
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// Sample data (akan digantikan dengan data dari Supabase)
let materiData = [];
let siswaData = [];
let attendanceData = [];
let nilaiData = [];
let jurnalData = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date for attendance
    document.getElementById('attendanceDate').valueAsDate = new Date();
    document.getElementById('jurnalDate').valueAsDate = new Date();
    
    // Initialize data from Supabase
    initializeData();
});

async function initializeData() {
    // Load settings first
    await loadSettingsFromSupabase();
    
    // Load other data
    await loadUsersFromSupabase();
    await loadMateriFromSupabase();
    await loadSiswaFromSupabase();
    await loadAttendanceFromSupabase();
    await loadNilaiFromSupabase();
    await loadJurnalFromSupabase();
    
    // Update UI
    updateMateriCounts();
}

async function loadSettingsFromSupabase() {
    const { data, error } = await supabase
        .from('settings')
        .select('*');
    
    if (error) {
        console.error('Error loading settings:', error);
        return;
    }
    
    if (data) {
        data.forEach(setting => {
            if (setting.key === 'logo') {
                websiteSettings.logo = setting.value.logo;
                websiteSettings.logoType = setting.value.type;
                websiteSettings.logoImage = setting.value.logoImage;
            } else if (setting.key === 'background') {
                websiteSettings.background = setting.value.background;
                websiteSettings.backgroundType = setting.value.type;
                websiteSettings.backgroundImage = setting.value.backgroundImage;
                websiteSettings.customGradient = setting.value.customGradient;
            } else if (setting.key === 'title') {
                websiteSettings.mainTitle = setting.value.mainTitle;
                websiteSettings.subTitle = setting.value.subTitle;
                websiteSettings.description = setting.value.description;
            }
        });
    }
}

async function loadUsersFromSupabase() {
    const { data, error } = await supabase
        .from('users')
        .select('*');
    
    if (error) {
        console.error('Error loading users:', error);
        return;
    }
    
    // Store users globally if needed
    window.userAccounts = {};
    if (data) {
        data.forEach(user => {
            window.userAccounts[user.username] = {
                password: user.password,
                type: user.type,
                name: user.name,
                nisn: user.nisn,
                kelas: user.kelas
            };
        });
    }
}

async function loadMateriFromSupabase() {
    const { data, error } = await supabase
        .from('materi')
        .select('*');
    
    if (error) {
        console.error('Error loading materi:', error);
        return;
    }
    
    materiData = data || [];
}

async function loadSiswaFromSupabase() {
    const { data, error } = await supabase
        .from('siswa')
        .select('*');
    
    if (error) {
        console.error('Error loading siswa:', error);
        return;
    }
    
    siswaData = data || [];
}

async function loadAttendanceFromSupabase() {
    const { data, error } = await supabase
        .from('attendance')
        .select('*');
    
    if (error) {
        console.error('Error loading attendance:', error);
        return;
    }
    
    attendanceData = data || [];
}

async function loadNilaiFromSupabase() {
    const { data, error } = await supabase
        .from('nilai')
        .select('*');
    
    if (error) {
        console.error('Error loading nilai:', error);
        return;
    }
    
    nilaiData = data || [];
}

async function loadJurnalFromSupabase() {
    const { data, error } = await supabase
        .from('jurnal')
        .select('*');
    
    if (error) {
        console.error('Error loading jurnal:', error);
        return;
    }
    
    jurnalData = data || [];
}

// Login functionality
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;
    
    // Validate credentials with Supabase
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('type', userType)
        .single();
    
    if (error || !data) {
        alert('Username atau tipe user tidak valid!');
        return;
    }
    
    // Bandingkan password (dalam aplikasi nyata, gunakan hashing)
    if (data.password !== password) {
        alert('Password tidak valid!');
        return;
    }
    
    currentUser = {
        id: data.id,
        username: data.username,
        type: data.type,
        name: data.name,
        nisn: data.nisn || null,
        kelas: data.kelas || null
    };
    
    document.getElementById('loginPage').classList.add('hidden');
    
    if (data.type === 'guru') {
        document.getElementById('teacherName').textContent = currentUser.name;
        document.getElementById('teacherDashboard').classList.remove('hidden');
        showTeacherSection('materi');
    } else {
        document.getElementById('studentName').textContent = currentUser.name;
        document.getElementById('studentDashboard').classList.remove('hidden');
        showStudentSection('materi');
    }
    
    loadData();
});

// Navigation functions
function showLoginForm(userType) {
    document.getElementById('welcomePage').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('userType').value = userType;
    
    // Update login form based on user type
    if (userType === 'guru') {
        document.getElementById('loginIcon').textContent = '👨‍🏫';
        document.getElementById('loginTitle').textContent = 'Login Guru';
        document.getElementById('loginSubtitle').textContent = 'Masuk sebagai guru';
    } else {
        document.getElementById('loginIcon').textContent = '👨‍🎓';
        document.getElementById('loginTitle').textContent = 'Login Siswa';
        document.getElementById('loginSubtitle').textContent = 'Masuk sebagai siswa';
    }
}

function backToWelcome() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('welcomePage').classList.remove('hidden');
    document.getElementById('loginForm').reset();
}

// Logout functionality
function logout() {
    currentUser = null;
    document.getElementById('teacherDashboard').classList.add('hidden');
    document.getElementById('studentDashboard').classList.add('hidden');
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('welcomePage').classList.remove('hidden');
    document.getElementById('loginForm').reset();
    
    // Clear token timer
    if (tokenInterval) {
        clearInterval(tokenInterval);
        tokenInterval = null;
    }
}

// Teacher navigation
function showTeacherSection(section) {
    // Hide all sections
    document.querySelectorAll('.teacher-section').forEach(el => el.classList.add('hidden'));
    
    // Remove active state from all nav buttons
    document.querySelectorAll('.teacher-nav-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-blue-600');
    });
    
    // Show selected section with animation
    const sectionEl = document.getElementById(section + 'Section');
    sectionEl.classList.remove('hidden');
    sectionEl.classList.add('fade-in');
    
    // Add active state to clicked nav button
    event.target.classList.add('active', 'bg-blue-600');
    
    // Load section-specific data
    if (section === 'materi') {
        loadMateriData();
    } else if (section === 'kelas') {
        loadKelasData();
    } else if (section === 'kehadiran') {
        loadKehadiranData();
    } else if (section === 'nilai') {
        loadNilaiData();
    } else if (section === 'jurnal') {
        loadJurnalData();
    } else if (section === 'pengaturan') {
        loadPengaturanData();
    }
}

// Student navigation
function showStudentSection(section) {
    // Hide all sections
    document.querySelectorAll('.student-section').forEach(el => el.classList.add('hidden'));
    
    // Remove active state from all nav buttons
    document.querySelectorAll('.student-nav-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-green-500');
    });
    
    // Show selected section with animation
    const sectionEl = document.getElementById('student' + section.charAt(0).toUpperCase() + section.slice(1) + 'Section');
    sectionEl.classList.remove('hidden');
    sectionEl.classList.add('fade-in');
    
    // Add active state to clicked nav button
    event.target.classList.add('active', 'bg-green-500');
    
    // Load section-specific data
    if (section === 'materi') {
        loadStudentMateriData();
    } else if (section === 'kehadiran') {
        loadStudentKehadiranData();
    } else if (section === 'nilai') {
        loadStudentNilaiData();
    } else if (section === 'jurnal') {
        loadStudentJurnalData();
    }
}

// Load data functions
function loadData() {
    loadMateriData();
    loadKelasData();
    loadKehadiranData();
    loadNilaiData();
    loadJurnalData();
    loadStudentMateriData();
    loadStudentKehadiranData();
    loadStudentNilaiData();
    loadStudentJurnalData();
}

function updateMateriCounts() {
    const countX = materiData.filter(m => m.kelas === 'X').length;
    const countXI = materiData.filter(m => m.kelas === 'XI').length;
    const countXII = materiData.filter(m => m.kelas === 'XII').length;
    
    document.getElementById('materiCountX').textContent = `${countX} Materi`;
    document.getElementById('materiCountXI').textContent = `${countXI} Materi`;
    document.getElementById('materiCountXII').textContent = `${countXII} Materi`;
}

function showMateriByClass(kelas) {
    currentSelectedClass = kelas;
    document.getElementById('materiClassView').classList.add('hidden');
    document.getElementById('materiDetailView').classList.remove('hidden');
    document.getElementById('currentMateriClass').textContent = kelas;
    loadMateriData();
}

function backToMateriClassView() {
    document.getElementById('materiDetailView').classList.add('hidden');
    document.getElementById('materiClassView').classList.remove('hidden');
    currentSelectedClass = '';
}

async function loadMateriData() {
    const materiList = document.getElementById('materiList');
    materiList.innerHTML = '';
    
    // Filter materi by selected class
    const filteredMateri = currentSelectedClass ? 
        materiData.filter(m => m.kelas === currentSelectedClass) : 
        materiData;
    
    if (filteredMateri.length === 0) {
        materiList.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-gray-400 text-6xl mb-4">📚</div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Belum ada materi</h3>
                <p class="text-gray-500">Klik tombol "Tambah Materi" untuk menambah materi baru</p>
            </div>
        `;
        return;
    }
    
    filteredMateri.forEach((materi, index) => {
        const materiCard = document.createElement('div');
        materiCard.className = 'card-enhanced rounded-2xl p-6 hover-lift slide-up';
        materiCard.style.animationDelay = `${index * 0.1}s`;
        materiCard.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-gray-900">${materi.title}</h3>
                <span class="status-indicator bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium px-3 py-1 rounded-full">Kelas ${materi.kelas}</span>
            </div>
            <p class="text-gray-600 mb-6">${materi.description}</p>
            <div class="space-y-3">
                <div class="flex flex-wrap gap-2">
                    ${materi.ppt_link ? '<span class="status-indicator bg-green-100 text-green-800 text-xs px-3 py-2 rounded-full font-medium">📄 PPT</span>' : ''}
                    ${materi.video_link ? '<span class="status-indicator bg-red-100 text-red-800 text-xs px-3 py-2 rounded-full font-medium">🎥 Video</span>' : ''}
                    ${materi.latihan_link ? '<span class="status-indicator bg-purple-100 text-purple-800 text-xs px-3 py-2 rounded-full font-medium">📝 Latihan</span>' : ''}
                    ${materi.modul_link ? '<span class="status-indicator bg-indigo-100 text-indigo-800 text-xs px-3 py-2 rounded-full font-medium">📚 Modul</span>' : ''}
                </div>
            </div>
            <div class="mt-6 flex justify-end">
                <button onclick="deleteMateri('${materi.id}')" class="glass text-red-600 hover:text-red-800 px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300 font-medium">
                    🗑️ Hapus
                </button>
            </div>
        `;
        materiList.appendChild(materiCard);
    });
}

async function loadStudentMateriData() {
    const studentMateriList = document.getElementById('studentMateriList');
    studentMateriList.innerHTML = '';
    
    if (!currentUser || !currentUser.kelas) {
        studentMateriList.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-gray-400 text-6xl mb-4">📚</div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Tidak dapat memuat materi</h3>
                <p class="text-gray-500">Informasi kelas tidak ditemukan</p>
            </div>
        `;
        return;
    }
    
    // Get student's class level (X, XI, XII)
    let studentClassLevel = '';
    const kelasUpper = currentUser.kelas.toUpperCase();
    
    if (kelasUpper.includes('XII') || kelasUpper.includes('12')) {
        studentClassLevel = 'XII';
    } else if (kelasUpper.includes('XI') || kelasUpper.includes('11')) {
        studentClassLevel = 'XI';
    } else if (kelasUpper.includes('X') || kelasUpper.includes('10')) {
        studentClassLevel = 'X';
    }
    
    // Filter materials by student's class level
    const studentMateri = materiData.filter(materi => materi.kelas === studentClassLevel);
    
    if (studentMateri.length === 0) {
        studentMateriList.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-gray-400 text-6xl mb-4">📚</div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Belum ada materi</h3>
                <p class="text-gray-500">Materi untuk kelas ${studentClassLevel} belum tersedia</p>
            </div>
        `;
        return;
    }
    
    studentMateri.forEach((materi, index) => {
        const materiCard = document.createElement('div');
        materiCard.className = 'card-enhanced rounded-2xl p-6 hover-lift bounce-in';
        materiCard.style.animationDelay = `${index * 0.15}s`;
        
        // Count available files to determine grid layout
        const availableFiles = [
            materi.ppt_link,
            materi.video_link,
            materi.latihan_link,
            materi.modul_link
        ].filter(file => file && file.trim() !== '');
        
        const gridCols = availableFiles.length === 1 ? 'grid-cols-1' : 
                       availableFiles.length === 2 ? 'grid-cols-2' : 
                       availableFiles.length === 3 ? 'grid-cols-3' : 'grid-cols-2';
        
        materiCard.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-gray-900">${materi.title}</h3>
                <span class="status-indicator bg-gradient-to-r from-green-500 to-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">Kelas ${materi.kelas}</span>
            </div>
            <p class="text-gray-600 mb-6">${materi.description}</p>
            <div class="space-y-4">
                <div class="grid ${gridCols} gap-3">
                    ${materi.ppt_link ? `<button onclick="openLink('${materi.ppt_link}')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl hover:scale-105 transition-all duration-300 font-medium shadow-lg">📄 Buka PPT</button>` : ''}
                    ${materi.video_link ? `<button onclick="openLink('${materi.video_link}')" class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-xl hover:scale-105 transition-all duration-300 font-medium shadow-lg">🎥 Buka Video</button>` : ''}
                    ${materi.latihan_link ? `<button onclick="openLink('${materi.latihan_link}')" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl hover:scale-105 transition-all duration-300 font-medium shadow-lg">📝 Buka Latihan</button>` : ''}
                    ${materi.modul_link ? `<button onclick="openLink('${materi.modul_link}')" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl hover:scale-105 transition-all duration-300 font-medium shadow-lg">📚 Buka Modul</button>` : ''}
                </div>
            </div>
        `;
        studentMateriList.appendChild(materiCard);
    });
}

async function loadKelasData() {
    const siswaList = document.getElementById('siswaList');
    const kelasFilter = document.getElementById('kelasFilter');
    const nilaiKelasFilter = document.getElementById('nilaiKelasFilter');
    const kelasFilterSiswa = document.getElementById('kelasFilterSiswa');
    const kelasFilterKehadiran = document.getElementById('kelasFilterKehadiran');
    
    // Clear existing data
    siswaList.innerHTML = '';
    
    // Populate class filters
    const classes = [...new Set(siswaData.map(siswa => siswa.kelas))].sort();
    kelasFilter.innerHTML = '<option value="">Semua Kelas</option>';
    nilaiKelasFilter.innerHTML = '<option value="">Semua Kelas</option>';
    kelasFilterSiswa.innerHTML = '<option value="">Semua Kelas</option>';
    kelasFilterKehadiran.innerHTML = '<option value="">Semua Kelas</option>';
    
    classes.forEach(kelas => {
        kelasFilter.innerHTML += `<option value="${kelas}">${kelas}</option>`;
        nilaiKelasFilter.innerHTML += `<option value="${kelas}">${kelas}</option>`;
        kelasFilterSiswa.innerHTML += `<option value="${kelas}">${kelas}</option>`;
        kelasFilterKehadiran.innerHTML += `<option value="${kelas}">${kelas}</option>`;
    });
    
    // Populate student list (initially show all)
    filterSiswaByClass();
}

function filterSiswaByClass() {
    const siswaList = document.getElementById('siswaList');
    const selectedClass = document.getElementById('kelasFilterSiswa').value;
    
    siswaList.innerHTML = '';
    
    const filteredSiswa = selectedClass ? 
        siswaData.filter(siswa => siswa.kelas === selectedClass) : 
        siswaData;
    
    if (filteredSiswa.length === 0) {
        siswaList.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                    <div class="text-4xl mb-2">👥</div>
                    Tidak ada siswa ditemukan
                </td>
            </tr>
        `;
        return;
    }
    
    filteredSiswa.forEach(siswa => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${siswa.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${siswa.nisn}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${siswa.kelas}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button onclick="deleteSiswa('${siswa.id}')" class="text-red-600 hover:text-red-900">Hapus</button>
            </td>
        `;
        siswaList.appendChild(row);
    });
}

async function loadKehadiranData() {
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
    document.getElementById('endDate').value = today;
    
    filterAttendance();
}

function filterAttendance() {
    const attendanceList = document.getElementById('attendanceList');
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const selectedClass = document.getElementById('kelasFilterKehadiran').value;
    
    attendanceList.innerHTML = '';
    
    // Filter siswa by class if selected
    const filteredSiswa = selectedClass ? 
        siswaData.filter(siswa => siswa.kelas === selectedClass) : 
        siswaData;
    
    if (filteredSiswa.length === 0) {
        attendanceList.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                    <div class="text-4xl mb-2">📅</div>
                    Tidak ada data kehadiran ditemukan
                </td>
            </tr>
        `;
        return;
    }
    
    // Use today's date if no date range specified
    const filterStartDate = startDate || new Date().toISOString().split('T')[0];
    const filterEndDate = endDate || filterStartDate;
    
    filteredSiswa.forEach(siswa => {
        // Get attendance within date range
        const attendanceInRange = attendanceData.filter(att => 
            att.siswa_id === siswa.id && 
            att.date >= filterStartDate && 
            att.date <= filterEndDate
        );
        
        // Show latest attendance or default to alpha
        const latestAttendance = attendanceInRange.length > 0 ? 
            attendanceInRange[attendanceInRange.length - 1] : 
            { status: 'alpha', time: '-' };
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${siswa.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${siswa.nisn}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${siswa.kelas}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(latestAttendance.status)}">
                    ${latestAttendance.status.toUpperCase()}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <select onchange="updateAttendance('${siswa.id}', this.value)" class="text-xs border rounded px-2 py-1">
                    <option value="hadir" ${latestAttendance.status === 'hadir' ? 'selected' : ''}>Hadir</option>
                    <option value="sakit" ${latestAttendance.status === 'sakit' ? 'selected' : ''}>Sakit</option>
                    <option value="izin" ${latestAttendance.status === 'izin' ? 'selected' : ''}>Izin</option>
                    <option value="alpha" ${latestAttendance.status === 'alpha' ? 'selected' : ''}>Alpha</option>
                </select>
            </td>
        `;
        attendanceList.appendChild(row);
    });
}

async function loadNilaiData() {
    const nilaiList = document.getElementById('nilaiList');
    nilaiList.innerHTML = '';
    
    // Get nilai with student info
    const { data: nilaiWithSiswa, error } = await supabase
        .from('nilai')
        .select(`
            *,
            siswa (name, nisn, kelas)
        `);
    
    if (error) {
        console.error('Error loading nilai:', error);
        return;
    }
    
    if (!nilaiWithSiswa || nilaiWithSiswa.length === 0) {
        nilaiList.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <div class="text-4xl mb-2">📊</div>
                    Tidak ada data nilai ditemukan
                </td>
            </tr>
        `;
        return;
    }
    
    nilaiWithSiswa.forEach(nilai => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${nilai.siswa.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${nilai.siswa.nisn}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${nilai.siswa.kelas}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${nilai.jenis}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${nilai.nilai}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button onclick="editNilai('${nilai.id}')" class="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
                <button onclick="deleteNilai('${nilai.id}')" class="text-red-600 hover:text-red-900">Hapus</button>
            </td>
        `;
        nilaiList.appendChild(row);
    });
}

async function loadJurnalData() {
    const jurnalList = document.getElementById('jurnalList');
    jurnalList.innerHTML = '';
    
    if (jurnalData.length === 0) {
        jurnalList.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6 text-center">
                <div class="text-gray-400 text-6xl mb-4">📝</div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Belum ada jurnal</h3>
                <p class="text-gray-500">Klik tombol "Tambah Jurnal" untuk menambah jurnal baru</p>
            </div>
        `;
        return;
    }
    
    // Sort by date descending
    const sortedJurnal = [...jurnalData].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedJurnal.forEach(jurnal => {
        const jurnalCard = document.createElement('div');
        jurnalCard.className = 'bg-white rounded-lg shadow-md p-6';
        jurnalCard.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-semibold text-gray-900">Kelas ${jurnal.kelas}</h3>
                    <p class="text-sm text-gray-500">${new Date(jurnal.date).toLocaleDateString('id-ID')}</p>
                </div>
                <button onclick="deleteJurnal('${jurnal.id}')" class="text-red-600 hover:text-red-800">
                    🗑️ Hapus
                </button>
            </div>
            <p class="text-gray-700">${jurnal.note}</p>
        `;
        jurnalList.appendChild(jurnalCard);
    });
}

async function loadStudentKehadiranData() {
    const studentAttendanceHistory = document.getElementById('studentAttendanceHistory');
    studentAttendanceHistory.innerHTML = '';
    
    if (!currentUser || !currentUser.nisn) {
        studentAttendanceHistory.innerHTML = `
            <tr>
                <td colspan="3" class="px-6 py-12 text-center text-gray-500">
                    <div class="text-4xl mb-2">📅</div>
                    Tidak dapat memuat riwayat kehadiran
                </td>
            </tr>
        `;
        return;
    }
    
    // Find current student in siswaData
    const currentStudent = siswaData.find(s => s.nisn === currentUser.nisn);
    if (!currentStudent) {
        studentAttendanceHistory.innerHTML = `
            <tr>
                <td colspan="3" class="px-6 py-12 text-center text-gray-500">
                    <div class="text-4xl mb-2">📅</div>
                    Data siswa tidak ditemukan
                </td>
            </tr>
        `;
        return;
    }
    
    // Get student's attendance records
    const studentAttendances = attendanceData
        .filter(att => att.siswa_id === currentStudent.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending
    
    if (studentAttendances.length === 0) {
        studentAttendanceHistory.innerHTML = `
            <tr>
                <td colspan="3" class="px-6 py-12 text-center text-gray-500">
                    <div class="text-4xl mb-2">📅</div>
                    Belum ada riwayat kehadiran
                </td>
            </tr>
        `;
        return;
    }
    
    studentAttendances.forEach(attendance => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(attendance.date).toLocaleDateString('id-ID')}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(attendance.status)}">
                    ${attendance.status.toUpperCase()}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${attendance.time}</td>
        `;
        studentAttendanceHistory.appendChild(row);
    });
}

async function loadStudentNilaiData() {
    const studentNilaiList = document.getElementById('studentNilaiList');
    studentNilaiList.innerHTML = '';
    
    if (!currentUser || !currentUser.nisn) {
        studentNilaiList.innerHTML = `
            <tr>
                <td colspan="3" class="px-6 py-12 text-center text-gray-500">
                    <div class="text-4xl mb-2">📊</div>
                    Tidak dapat memuat nilai
                </td>
            </tr>
        `;
        return;
    }
    
    // Find current student in siswaData
    const currentStudent = siswaData.find(s => s.nisn === currentUser.nisn);
    if (!currentStudent) {
        studentNilaiList.innerHTML = `
            <tr>
                <td colspan="3" class="px-6 py-12 text-center text-gray-500">
                    <div class="text-4xl mb-2">📊</div>
                    Data siswa tidak ditemukan
                </td>
            </tr>
        `;
        return;
    }
    
    // Get student's grades
    const studentGrades = nilaiData
        .filter(nilai => nilai.siswa_id === currentStudent.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending
    
    if (studentGrades.length === 0) {
        studentNilaiList.innerHTML = `
            <tr>
                <td colspan="3" class="px-6 py-12 text-center text-gray-500">
                    <div class="text-4xl mb-2">📊</div>
                    Belum ada nilai
                </td>
            </tr>
        `;
        return;
    }
    
    studentGrades.forEach(grade => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${grade.jenis}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${grade.nilai}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(grade.date).toLocaleDateString('id-ID')}</td>
        `;
        studentNilaiList.appendChild(row);
    });
}

async function loadStudentJurnalData() {
    const studentJurnalList = document.getElementById('studentJurnalList');
    studentJurnalList.innerHTML = '';
    
    if (!currentUser || !currentUser.kelas) {
        studentJurnalList.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6 text-center">
                <div class="text-gray-400 text-6xl mb-4">📝</div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Tidak dapat memuat jurnal</h3>
                <p class="text-gray-500">Informasi kelas tidak ditemukan</p>
            </div>
        `;
        return;
    }
    
    // Filter jurnal by student's class
    const studentJurnal = jurnalData.filter(jurnal => jurnal.kelas === currentUser.kelas);
    
    if (studentJurnal.length === 0) {
        studentJurnalList.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6 text-center">
                <div class="text-gray-400 text-6xl mb-4">📝</div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Belum ada jurnal</h3>
                <p class="text-gray-500">Jurnal untuk kelas ${currentUser.kelas} belum tersedia</p>
            </div>
        `;
        return;
    }
    
    // Sort by date descending
    studentJurnal.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    studentJurnal.forEach(jurnal => {
        const jurnalCard = document.createElement('div');
        jurnalCard.className = 'bg-white rounded-lg shadow-md p-6';
        jurnalCard.innerHTML = `
            <div class="mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Kelas ${jurnal.kelas}</h3>
                <p class="text-sm text-gray-500">${new Date(jurnal.date).toLocaleDateString('id-ID')}</p>
            </div>
            <p class="text-gray-700">${jurnal.note}</p>
        `;
        studentJurnalList.appendChild(jurnalCard);
    });
}

// Token management
function generateToken() {
    currentToken = Math.random().toString(36).substring(2, 8).toUpperCase();
    document.getElementById('currentToken').textContent = currentToken;
    
    // Reset timer
    tokenTimer = 30;
    document.getElementById('tokenTimer').textContent = tokenTimer;
    
    // Clear existing interval
    if (tokenInterval) {
        clearInterval(tokenInterval);
    }
    
    // Start new timer
    tokenInterval = setInterval(() => {
        tokenTimer--;
        document.getElementById('tokenTimer').textContent = tokenTimer;
        
        if (tokenTimer <= 0) {
            generateToken(); // Auto-generate new token
        }
    }, 1000);
}

// Attendance functions
async function markAllPresent() {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('id-ID');
    
    for (const siswa of siswaData) {
        // Remove existing attendance for today
        await supabase
            .from('attendance')
            .delete()
            .eq('siswa_id', siswa.id)
            .eq('date', today);
        
        // Add new attendance
        await supabase
            .from('attendance')
            .insert([{
                siswa_id: siswa.id,
                date: today,
                status: 'hadir',
                time: currentTime
            }]);
    }
    
    // Refresh data
    await loadAttendanceFromSupabase();
    loadKehadiranData();
    alert('Semua siswa telah ditandai hadir!');
}

async function updateAttendance(siswaId, status) {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('id-ID');
    
    // Check if attendance exists for today
    const { data: existingAttendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('siswa_id', siswaId)
        .eq('date', today);
    
    if (existingAttendance && existingAttendance.length > 0) {
        // Update existing attendance
        await supabase
            .from('attendance')
            .update({ 
                status: status,
                time: status === 'alpha' ? '-' : currentTime
            })
            .eq('id', existingAttendance[0].id);
    } else {
        // Insert new attendance
        await supabase
            .from('attendance')
            .insert([{
                siswa_id: siswaId,
                date: today,
                status: status,
                time: status === 'alpha' ? '-' : currentTime
            }]);
    }
    
    // Refresh data
    await loadAttendanceFromSupabase();
    loadKehadiranData();
}

function printAttendance() {
    const printWindow = window.open('', '_blank');
    const selectedClass = document.getElementById('kelasFilterKehadiran').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    let title = 'Rekap Kehadiran';
    if (selectedClass) title += ` Kelas ${selectedClass}`;
    if (startDate && endDate) {
        if (startDate === endDate) {
            title += ` Tanggal ${new Date(startDate).toLocaleDateString('id-ID')}`;
        } else {
            title += ` Periode ${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}`;
        }
    }
    
    // Filter siswa by class if selected
    const filteredSiswa = selectedClass ? 
        siswaData.filter(siswa => siswa.kelas === selectedClass) : 
        siswaData;
    
    // Filter attendance by date range
    const filterStartDate = startDate || new Date().toISOString().split('T')[0];
    const filterEndDate = endDate || filterStartDate;
    
    printWindow.document.write(`
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .header { text-align: center; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>${title}</h2>
                <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Nama</th>
                        <th>NISN</th>
                        <th>Kelas</th>
                        <th>Hadir</th>
                        <th>Sakit</th>
                        <th>Izin</th>
                        <th>Alpha</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredSiswa.map((siswa, index) => {
                        const attendances = attendanceData.filter(att => 
                            att.siswa_id === siswa.id && 
                            att.date >= filterStartDate && 
                            att.date <= filterEndDate
                        );
                        const hadir = attendances.filter(att => att.status === 'hadir').length;
                        const sakit = attendances.filter(att => att.status === 'sakit').length;
                        const izin = attendances.filter(att => att.status === 'izin').length;
                        const alpha = attendances.filter(att => att.status === 'alpha').length;
                        
                        return `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${siswa.name}</td>
                                <td>${siswa.nisn}</td>
                                <td>${siswa.kelas}</td>
                                <td>${hadir}</td>
                                <td>${sakit}</td>
                                <td>${izin}</td>
                                <td>${alpha}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Student attendance functions
function getLocation() {
    if (navigator.geolocation) {
        document.getElementById('locationStatus').textContent = 'Mendapatkan lokasi...';
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                currentLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                document.getElementById('locationStatus').textContent = 
                    `Lokasi ditemukan: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`;
            },
            function(error) {
                document.getElementById('locationStatus').textContent = 'Gagal mendapatkan lokasi: ' + error.message;
            }
        );
    } else {
        document.getElementById('locationStatus').textContent = 'Geolocation tidak didukung browser ini';
    }
}

document.getElementById('studentAttendanceForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nisn = document.getElementById('studentNISN').value;
    const token = document.getElementById('attendanceToken').value;
    
    if (!currentLocation) {
        alert('Silakan dapatkan lokasi terlebih dahulu!');
        return;
    }
    
    if (token !== currentToken) {
        alert('Token tidak valid atau sudah kadaluarsa!');
        return;
    }
    
    // Find student by NISN
    const student = siswaData.find(s => s.nisn === nisn);
    if (!student) {
        alert('NISN tidak ditemukan!');
        return;
    }
    
    // Record attendance
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('id-ID');
    
    // Remove existing attendance for today
    await supabase
        .from('attendance')
        .delete()
        .eq('siswa_id', student.id)
        .eq('date', today);
    
    // Add new attendance
    await supabase
        .from('attendance')
        .insert([{
            siswa_id: student.id,
            date: today,
            status: 'hadir',
            time: currentTime,
            location: currentLocation
        }]);
    
    alert('Absensi berhasil dicatat!');
    document.getElementById('studentAttendanceForm').reset();
    document.getElementById('locationStatus').textContent = '';
    currentLocation = null;
    
    // Refresh data
    await loadAttendanceFromSupabase();
    loadStudentKehadiranData();
});

// Modal functions
function showAddMateriModal() {
    document.getElementById('addMateriModal').classList.remove('hidden');
    document.getElementById('addMateriModal').classList.add('flex');
}

function showAddKelasModal() {
    document.getElementById('addKelasModal').classList.remove('hidden');
    document.getElementById('addKelasModal').classList.add('flex');
}

function showAddJurnalModal() {
    // Populate class options
    const jurnalKelasSelect = document.getElementById('jurnalKelas');
    const classes = [...new Set(siswaData.map(siswa => siswa.kelas))].sort();
    
    jurnalKelasSelect.innerHTML = '<option value="">Pilih Kelas</option>';
    classes.forEach(kelas => {
        jurnalKelasSelect.innerHTML += `<option value="${kelas}">${kelas}</option>`;
    });
    
    document.getElementById('addJurnalModal').classList.remove('hidden');
    document.getElementById('addJurnalModal').classList.add('flex');
}

function showImportModal() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = async function(e) {
        const file = e.target.files[0];
        if (file) {
            // Simulate file processing
            alert(`Mengimpor file: ${file.name}\n\nFormat yang didukung:\n- CSV: nama,nisn,kelas\n- Excel: kolom A=nama, B=nisn, C=kelas\n\nContoh data berhasil diimpor!`);
            
            // Add sample imported data
            const importedData = [
                { name: 'Andi Pratama', nisn: '2024001001', kelas: 'X-4' },
                { name: 'Sari Dewi', nisn: '2024001002', kelas: 'XI-3' },
                { name: 'Budi Hartono', nisn: '2024001003', kelas: 'XII-4' }
            ];
            
            // Insert to Supabase
            for (const siswa of importedData) {
                await supabase
                    .from('siswa')
                    .insert([siswa]);
            }
            
            // Refresh data
            await loadSiswaFromSupabase();
            loadKelasData();
            loadKehadiranData();
        }
    };
    input.click();
}

function showUploadNilaiModal() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = async function(e) {
        const file = e.target.files[0];
        if (file) {
            // Show upload options
            const jenis = prompt('Pilih jenis nilai:\n1. UH1\n2. UH2\n3. PTS\n4. PAS\n\nMasukkan nomor (1-4):', '1');
            const jenisMap = { '1': 'UH1', '2': 'UH2', '3': 'PTS', '4': 'PAS' };
            const selectedJenis = jenisMap[jenis] || 'UH1';
            
            alert(`Mengupload nilai ${selectedJenis} dari file: ${file.name}\n\nFormat yang didukung:\n- CSV: nisn,nilai\n- Excel: kolom A=nisn, B=nilai\n\nContoh data berhasil diupload!`);
            
            // Add sample uploaded grades
            for (const siswa of siswaData) {
                // Remove existing grade of same type
                await supabase
                    .from('nilai')
                    .delete()
                    .eq('siswa_id', siswa.id)
                    .eq('jenis', selectedJenis);
                
                // Add new grade
                await supabase
                    .from('nilai')
                    .insert([{
                        siswa_id: siswa.id,
                        jenis: selectedJenis,
                        nilai: Math.floor(Math.random() * 40) + 60, // Random grade 60-100
                        date: new Date().toISOString().split('T')[0]
                    }]);
            }
            
            // Refresh data
            await loadNilaiFromSupabase();
            loadNilaiData();
        }
    };
    input.click();
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    document.getElementById(modalId).classList.remove('flex');
}

// Form submissions
document.getElementById('addMateriForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const selectedKelas = document.getElementById('materiKelas').value;
    
    // If we're in a specific class view, use that class
    const kelasToUse = currentSelectedClass || selectedKelas;
    
    const newMateri = {
        title: document.getElementById('materiTitle').value,
        kelas: kelasToUse,
        description: document.getElementById('materiDescription').value,
        ppt_link: document.getElementById('materiPPTLink').value || null,
        video_link: document.getElementById('materiVideoLink').value || null,
        latihan_link: document.getElementById('materiLatihanLink').value || null,
        modul_link: document.getElementById('materiModulLink').value || null
    };
    
    const { data, error } = await supabase
        .from('materi')
        .insert([newMateri]);
    
    if (error) {
        console.error('Error adding materi:', error);
        alert('Gagal menambah materi!');
        return;
    }
    
    // Refresh data
    await loadMateriFromSupabase();
    loadMateriData();
    loadStudentMateriData();
    updateMateriCounts();
    closeModal('addMateriModal');
    this.reset();
    
    alert('Materi berhasil ditambahkan!');
});

document.getElementById('addKelasForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const newSiswa = {
        name: document.getElementById('siswaName').value,
        nisn: document.getElementById('siswaNISN').value,
        kelas: document.getElementById('siswaKelas').value
    };
    
    const { data, error } = await supabase
        .from('siswa')
        .insert([newSiswa]);
    
    if (error) {
        console.error('Error adding siswa:', error);
        alert('Gagal menambah siswa!');
        return;
    }
    
    // Refresh data
    await loadSiswaFromSupabase();
    loadKelasData();
    loadKehadiranData();
    closeModal('addKelasModal');
    this.reset();
    
    alert('Siswa berhasil ditambahkan!');
});

document.getElementById('addJurnalForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const newJurnal = {
        kelas: document.getElementById('jurnalKelas').value,
        date: document.getElementById('jurnalDate').value,
        note: document.getElementById('jurnalNote').value
    };
    
    const { data, error } = await supabase
        .from('jurnal')
        .insert([newJurnal]);
    
    if (error) {
        console.error('Error adding jurnal:', error);
        alert('Gagal menambah jurnal!');
        return;
    }
    
    // Refresh data
    await loadJurnalFromSupabase();
    loadJurnalData();
    loadStudentJurnalData();
    closeModal('addJurnalModal');
    this.reset();
    
    alert('Jurnal berhasil ditambahkan!');
});

// Delete functions
async function deleteMateri(id) {
    if (confirm('Yakin ingin menghapus materi ini?')) {
        const { error } = await supabase
            .from('materi')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting materi:', error);
            alert('Gagal menghapus materi!');
            return;
        }
        
        // Refresh data
        await loadMateriFromSupabase();
        loadMateriData();
        loadStudentMateriData();
        updateMateriCounts();
        alert('Materi berhasil dihapus!');
    }
}

async function deleteSiswa(id) {
    if (confirm('Yakin ingin menghapus siswa ini?')) {
        const { error } = await supabase
            .from('siswa')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting siswa:', error);
            alert('Gagal menghapus siswa!');
            return;
        }
        
        // Refresh data
        await loadSiswaFromSupabase();
        await loadAttendanceFromSupabase();
        await loadNilaiFromSupabase();
        loadKelasData();
        filterAttendance();
        loadNilaiData();
        alert('Siswa berhasil dihapus!');
    }
}

async function deleteNilai(id) {
    if (confirm('Yakin ingin menghapus nilai ini?')) {
        const { error } = await supabase
            .from('nilai')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting nilai:', error);
            alert('Gagal menghapus nilai!');
            return;
        }
        
        // Refresh data
        await loadNilaiFromSupabase();
        loadNilaiData();
        alert('Nilai berhasil dihapus!');
    }
}

async function deleteJurnal(id) {
    if (confirm('Yakin ingin menghapus jurnal ini?')) {
        const { error } = await supabase
            .from('jurnal')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting jurnal:', error);
            alert('Gagal menghapus jurnal!');
            return;
        }
        
        // Refresh data
        await loadJurnalFromSupabase();
        loadJurnalData();
        loadStudentJurnalData();
        alert('Jurnal berhasil dihapus!');
    }
}

// Utility functions
function getStatusColor(status) {
    switch(status) {
        case 'hadir': return 'bg-green-100 text-green-800';
        case 'sakit': return 'bg-yellow-100 text-yellow-800';
        case 'izin': return 'bg-blue-100 text-blue-800';
        case 'alpha': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function downloadFile(filename) {
    // Simulate file download
    alert(`Mengunduh file: ${filename}`);
}

function openLink(url) {
    if (url && url.trim() !== '') {
        window.open(url, '_blank', 'noopener,noreferrer');
    } else {
        alert('Link tidak tersedia');
    }
}

async function editNilai(id) {
    // Get current nilai
    const { data, error } = await supabase
        .from('nilai')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error || !data) {
        console.error('Error getting nilai:', error);
        alert('Gagal mengambil data nilai!');
        return;
    }
    
    const newNilai = prompt('Masukkan nilai baru:', data.nilai);
    if (newNilai !== null && !isNaN(newNilai)) {
        const { error: updateError } = await supabase
            .from('nilai')
            .update({ nilai: parseInt(newNilai) })
            .eq('id', id);
        
        if (updateError) {
            console.error('Error updating nilai:', updateError);
            alert('Gagal mengupdate nilai!');
            return;
        }
        
        // Refresh data
        await loadNilaiFromSupabase();
        loadNilaiData();
        alert('Nilai berhasil diupdate!');
    }
}

// Settings functions
async function loadPengaturanData() {
    // Update preview elements with current settings
    document.getElementById('currentLogoIcon').textContent = websiteSettings.logo;
    document.getElementById('mainTitleInput').value = websiteSettings.mainTitle;
    document.getElementById('subTitleInput').value = websiteSettings.subTitle;
    document.getElementById('descriptionInput').value = websiteSettings.description;
    
    // Update background preview
    updateBackgroundPreview();
}

async function changeLogo(emoji) {
    websiteSettings.logo = emoji;
    
    // Update in Supabase
    const { error } = await supabase
        .from('settings')
        .update({ 
            value: { 
                logo: emoji, 
                type: 'emoji', 
                logoImage: null 
            } 
        })
        .eq('key', 'logo');
    
    if (error) {
        console.error('Error updating logo:', error);
        alert('Gagal mengupdate logo!');
        return;
    }
    
    updateAllLogos();
    showSuccessMessage('Logo berhasil diubah!');
}

async function setCustomLogo() {
    const customLogo = document.getElementById('customLogoInput').value.trim();
    if (customLogo) {
        websiteSettings.logo = customLogo;
        
        // Update in Supabase
        const { error } = await supabase
            .from('settings')
            .update({ 
                value: { 
                    logo: customLogo, 
                    type: 'emoji', 
                    logoImage: null 
                } 
            })
            .eq('key', 'logo');
        
        if (error) {
            console.error('Error updating logo:', error);
            alert('Gagal mengupdate logo!');
            return;
        }
        
        updateAllLogos();
        document.getElementById('customLogoInput').value = '';
        showSuccessMessage('Logo kustom berhasil diterapkan!');
    } else {
        alert('Masukkan emoji untuk logo kustom!');
    }
}

function updateAllLogos() {
    if (websiteSettings.logoType === 'image' && websiteSettings.logoImage) {
        // Update with image logo
        updateLogoElements(websiteSettings.logoImage, true);
    } else {
        // Update with emoji logo
        updateLogoElements(websiteSettings.logo, false);
    }
}

function updateLogoElements(logoContent, isImage) {
    // Update preview logo
    const currentLogoIcon = document.getElementById('currentLogoIcon');
    if (currentLogoIcon) {
        if (isImage) {
            currentLogoIcon.innerHTML = `<img src="${logoContent}" class="w-8 h-8 object-contain" alt="Logo">`;
        } else {
            currentLogoIcon.textContent = logoContent;
        }
    }
    
    // Update welcome page main logo
    const welcomeMainLogos = document.querySelectorAll('#welcomePage .gradient-green span');
    welcomeMainLogos.forEach(el => {
        if (isImage) {
            el.innerHTML = `<img src="${logoContent}" class="w-12 h-12 object-contain" alt="Logo">`;
        } else {
            el.textContent = logoContent;
        }
    });
    
    // Update header logos (don't change role-specific icons)
    const headerLogos = document.querySelectorAll('header .bg-green-600 span, header .bg-blue-600 span');
    headerLogos.forEach(el => {
        if (isImage) {
            el.innerHTML = `<img src="${logoContent}" class="w-6 h-6 object-contain" alt="Logo">`;
        } else {
            el.textContent = logoContent;
        }
    });
}

async function changeBackground(backgroundClass) {
    websiteSettings.background = backgroundClass;
    
    // Update in Supabase
    const { error } = await supabase
        .from('settings')
        .update({ 
            value: { 
                background: backgroundClass, 
                type: 'gradient', 
                backgroundImage: null,
                customGradient: null
            } 
        })
        .eq('key', 'background');
    
    if (error) {
        console.error('Error updating background:', error);
        alert('Gagal mengupdate background!');
        return;
    }
    
    updateAllBackgrounds();
    updateBackgroundPreview();
    showSuccessMessage('Background berhasil diubah!');
}

async function setCustomBackground() {
    const color1 = document.getElementById('bgColor1').value;
    const color2 = document.getElementById('bgColor2').value;
    
    const customGradient = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
    websiteSettings.background = 'custom';
    websiteSettings.customGradient = customGradient;
    
    // Update in Supabase
    const { error } = await supabase
        .from('settings')
        .update({ 
            value: { 
                background: 'custom', 
                type: 'gradient', 
                backgroundImage: null,
                customGradient: customGradient
            } 
        })
        .eq('key', 'background');
    
    if (error) {
        console.error('Error updating background:', error);
        alert('Gagal mengupdate background!');
        return;
    }
    
    updateAllBackgrounds();
    updateBackgroundPreview();
    showSuccessMessage('Background kustom berhasil diterapkan!');
}

function updateAllBackgrounds() {
    const welcomePage = document.getElementById('welcomePage');
    const loginPage = document.getElementById('loginPage');
    
    // Remove all gradient classes
    const gradientClasses = ['gradient-blue', 'gradient-green', 'gradient-purple', 'gradient-orange', 'gradient-pink', 'gradient-teal'];
    gradientClasses.forEach(cls => {
        welcomePage.classList.remove(cls);
        loginPage.classList.remove(cls);
    });
    
    if (websiteSettings.backgroundType === 'image' && websiteSettings.backgroundImage) {
        // Use uploaded background image
        const backgroundStyle = `url('${websiteSettings.backgroundImage}') center/cover no-repeat, linear-gradient(135deg, rgba(30, 64, 175, 0.8) 0%, rgba(55, 48, 163, 0.8) 100%)`;
        welcomePage.style.background = backgroundStyle;
        loginPage.style.background = backgroundStyle;
    } else if (websiteSettings.background === 'custom' && websiteSettings.customGradient) {
        welcomePage.style.background = websiteSettings.customGradient;
        loginPage.style.background = websiteSettings.customGradient;
    } else {
        welcomePage.classList.add(websiteSettings.background);
        loginPage.classList.add(websiteSettings.background);
        welcomePage.style.background = '';
        loginPage.style.background = '';
    }
}

function updateBackgroundPreview() {
    const preview = document.getElementById('backgroundPreview');
    
    if (websiteSettings.backgroundType === 'image' && websiteSettings.backgroundImage) {
        // Show uploaded background image with overlay
        const backgroundStyle = `url('${websiteSettings.backgroundImage}') center/cover no-repeat, linear-gradient(135deg, rgba(30, 64, 175, 0.8) 0%, rgba(55, 48, 163, 0.8) 100%)`;
        preview.style.background = backgroundStyle;
    } else if (websiteSettings.background === 'custom' && websiteSettings.customGradient) {
        preview.style.background = websiteSettings.customGradient;
    } else {
        // Map background classes to actual gradients
        const gradientMap = {
            'gradient-blue': 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
            'gradient-green': 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            'gradient-purple': 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
            'gradient-orange': 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
            'gradient-pink': 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
            'gradient-teal': 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)'
        };
        
        preview.style.background = gradientMap[websiteSettings.background] || gradientMap['gradient-blue'];
    }
}

async function updateWebsiteTitle() {
    websiteSettings.mainTitle = document.getElementById('mainTitleInput').value;
    websiteSettings.subTitle = document.getElementById('subTitleInput').value;
    websiteSettings.description = document.getElementById('descriptionInput').value;
    
    // Update in Supabase
    const { error } = await supabase
        .from('settings')
        .update({ 
            value: { 
                mainTitle: websiteSettings.mainTitle,
                subTitle: websiteSettings.subTitle,
                description: websiteSettings.description
            } 
        })
        .eq('key', 'title');
    
    if (error) {
        console.error('Error updating title:', error);
        alert('Gagal mengupdate judul!');
        return;
    }
    
    // Update welcome page titles
    const mainTitleElements = document.querySelectorAll('h1');
    mainTitleElements.forEach(el => {
        if (el.textContent.includes('Fisika Learning') || el.textContent.includes('Dashboard')) {
            if (!el.textContent.includes('Dashboard')) {
                el.textContent = websiteSettings.mainTitle;
            }
        }
    });
    
    // Update subtitles and descriptions
    const welcomeTexts = document.querySelectorAll('#welcomePage p');
    if (welcomeTexts.length >= 2) {
        welcomeTexts[0].textContent = websiteSettings.subTitle;
        welcomeTexts[1].textContent = websiteSettings.description;
    }
    
    showSuccessMessage('Judul website berhasil diperbarui!');
}

async function resetLogo() {
    if (confirm('Yakin ingin mereset logo ke default?')) {
        websiteSettings.logo = '⚛️';
        websiteSettings.logoType = 'emoji';
        websiteSettings.logoImage = null;
        pendingLogoUpload = null;
        
        // Update in Supabase
        const { error } = await supabase
            .from('settings')
            .update({ 
                value: { 
                    logo: '⚛️', 
                    type: 'emoji', 
                    logoImage: null 
                } 
            })
            .eq('key', 'logo');
        
        if (error) {
            console.error('Error resetting logo:', error);
            alert('Gagal mereset logo!');
            return;
        }
        
        // Hide upload preview
        document.getElementById('logoUploadPreview').classList.add('hidden');
        document.getElementById('logoAppliedPreview').classList.add('hidden');
        document.getElementById('logoFileInput').value = '';
        
        updateAllLogos();
        loadPengaturanData();
        showSuccessMessage('Logo berhasil direset!');
    }
}

async function resetBackground() {
    if (confirm('Yakin ingin mereset background ke default?')) {
        websiteSettings.background = 'gradient-blue';
        websiteSettings.backgroundType = 'gradient';
        websiteSettings.backgroundImage = null;
        websiteSettings.customGradient = null;
        pendingBackgroundUpload = null;
        
        // Update in Supabase
        const { error } = await supabase
            .from('settings')
            .update({ 
                value: { 
                    background: 'gradient-blue', 
                    type: 'gradient', 
                    backgroundImage: null,
                    customGradient: null
                } 
            })
            .eq('key', 'background');
        
        if (error) {
            console.error('Error resetting background:', error);
            alert('Gagal mereset background!');
            return;
        }
        
        // Hide upload preview
        document.getElementById('backgroundUploadPreview').classList.add('hidden');
        document.getElementById('backgroundAppliedPreview').classList.add('hidden');
        document.getElementById('backgroundFileInput').value = '';
        
        updateAllBackgrounds();
        updateBackgroundPreview();
        showSuccessMessage('Background berhasil direset!');
    }
}

async function resetTitle() {
    if (confirm('Yakin ingin mereset judul ke default?')) {
        websiteSettings.mainTitle = 'Fisika Learning';
        websiteSettings.subTitle = 'Sistem Pembelajaran Fisika Digital';
        websiteSettings.description = 'Platform pembelajaran modern untuk guru dan siswa';
        
        // Update in Supabase
        const { error } = await supabase
            .from('settings')
            .update({ 
                value: { 
                    mainTitle: 'Fisika Learning',
                    subTitle: 'Sistem Pembelajaran Fisika Digital',
                    description: 'Platform pembelajaran modern untuk guru dan siswa'
                } 
            })
            .eq('key', 'title');
        
        if (error) {
            console.error('Error resetting title:', error);
            alert('Gagal mereset judul!');
            return;
        }
        
        updateWebsiteTitle();
        loadPengaturanData();
        showSuccessMessage('Judul berhasil direset!');
    }
}

async function resetAllSettings() {
    if (confirm('Yakin ingin mereset SEMUA pengaturan ke default? Tindakan ini tidak dapat dibatalkan!')) {
        websiteSettings = {
            logo: '⚛️',
            logoType: 'emoji',
            logoImage: null,
            background: 'gradient-blue',
            backgroundType: 'gradient',
            backgroundImage: null,
            mainTitle: 'Fisika Learning',
            subTitle: 'Sistem Pembelajaran Fisika Digital',
            description: 'Platform pembelajaran modern untuk guru dan siswa'
        };
        
        // Clear pending uploads
        pendingLogoUpload = null;
        pendingBackgroundUpload = null;
        
        // Hide all upload previews
        document.getElementById('logoUploadPreview').classList.add('hidden');
        document.getElementById('logoAppliedPreview').classList.add('hidden');
        document.getElementById('backgroundUploadPreview').classList.add('hidden');
        document.getElementById('backgroundAppliedPreview').classList.add('hidden');
        document.getElementById('logoFileInput').value = '';
        document.getElementById('backgroundFileInput').value = '';
        
        // Update in Supabase
        const { error: logoError } = await supabase
            .from('settings')
            .update({ 
                value: { 
                    logo: '⚛️', 
                    type: 'emoji', 
                    logoImage: null 
                } 
            })
            .eq('key', 'logo');
        
        const { error: backgroundError } = await supabase
            .from('settings')
            .update({ 
                value: { 
                    background: 'gradient-blue', 
                    type: 'gradient', 
                    backgroundImage: null,
                    customGradient: null
                } 
            })
            .eq('key', 'background');
        
        const { error: titleError } = await supabase
            .from('settings')
            .update({ 
                value: { 
                    mainTitle: 'Fisika Learning',
                    subTitle: 'Sistem Pembelajaran Fisika Digital',
                    description: 'Platform pembelajaran modern untuk guru dan siswa'
                } 
            })
            .eq('key', 'title');
        
        if (logoError || backgroundError || titleError) {
            console.error('Error resetting settings:', { logoError, backgroundError, titleError });
            alert('Gagal mereset pengaturan!');
            return;
        }
        
        updateAllLogos();
        updateAllBackgrounds();
        updateWebsiteTitle();
        loadPengaturanData();
        showSuccessMessage('Semua pengaturan berhasil direset!');
    }
}

// File upload handlers
let pendingLogoUpload = null;

function previewLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file terlalu besar! Maksimal 2MB.');
        event.target.value = '';
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar (JPG, PNG, GIF, SVG)!');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        // Store pending upload data
        pendingLogoUpload = imageData;
        
        // Show preview without applying
        document.getElementById('logoUploadPreview').classList.remove('hidden');
        document.getElementById('logoPreviewImage').src = imageData;
        document.getElementById('logoAppliedPreview').classList.add('hidden');
        
        showSuccessMessage('Preview logo siap! Klik "Terapkan Logo" untuk menerapkan.');
    };
    reader.readAsDataURL(file);
}

async function applyLogoUpload() {
    if (!pendingLogoUpload) {
        alert('Tidak ada logo untuk diterapkan!');
        return;
    }
    
    // Apply the logo
    websiteSettings.logoType = 'image';
    websiteSettings.logoImage = pendingLogoUpload;
    
    // Update in Supabase
    const { error } = await supabase
        .from('settings')
        .update({ 
            value: { 
                logo: websiteSettings.logo, 
                type: 'image', 
                logoImage: pendingLogoUpload 
            } 
        })
        .eq('key', 'logo');
    
    if (error) {
        console.error('Error updating logo:', error);
        alert('Gagal mengupdate logo!');
        return;
    }
    
    // Update all logos
    updateAllLogos();
    
    // Show applied state
    document.getElementById('logoAppliedPreview').classList.remove('hidden');
    
    // Clear pending upload
    pendingLogoUpload = null;
    
    showSuccessMessage('Logo berhasil diterapkan!');
}

function cancelLogoUpload() {
    // Clear pending upload
    pendingLogoUpload = null;
    
    // Hide preview
    document.getElementById('logoUploadPreview').classList.add('hidden');
    document.getElementById('logoFileInput').value = '';
    
    showSuccessMessage('Upload logo dibatalkan.');
}

let pendingBackgroundUpload = null;

function previewBackgroundUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file terlalu besar! Maksimal 5MB.');
        event.target.value = '';
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar (JPG, PNG)!');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        // Store pending upload data
        pendingBackgroundUpload = imageData;
        
        // Show preview without applying
        document.getElementById('backgroundUploadPreview').classList.remove('hidden');
        document.getElementById('backgroundPreviewImage').src = imageData;
        document.getElementById('backgroundAppliedPreview').classList.add('hidden');
        
        showSuccessMessage('Preview background siap! Klik "Terapkan Background" untuk menerapkan.');
    };
    reader.readAsDataURL(file);
}

async function applyBackgroundUpload() {
    if (!pendingBackgroundUpload) {
        alert('Tidak ada background untuk diterapkan!');
        return;
    }
    
    // Apply the background
    websiteSettings.backgroundType = 'image';
    websiteSettings.backgroundImage = pendingBackgroundUpload;
    
    // Update in Supabase
    const { error } = await supabase
        .from('settings')
        .update({ 
            value: { 
                background: websiteSettings.background, 
                type: 'image', 
                backgroundImage: pendingBackgroundUpload,
                customGradient: null
            } 
        })
        .eq('key', 'background');
    
    if (error) {
        console.error('Error updating background:', error);
        alert('Gagal mengupdate background!');
        return;
    }
    
    // Update all backgrounds
    updateAllBackgrounds();
    updateBackgroundPreview();
    
    // Show applied state
    document.getElementById('backgroundAppliedPreview').classList.remove('hidden');
    
    // Clear pending upload
    pendingBackgroundUpload = null;
    
    showSuccessMessage('Background berhasil diterapkan!');
}

function cancelBackgroundUpload() {
    // Clear pending upload
    pendingBackgroundUpload = null;
    
    // Hide preview
    document.getElementById('backgroundUploadPreview').classList.add('hidden');
    document.getElementById('backgroundFileInput').value = '';
    
    showSuccessMessage('Upload background dibatalkan.');
}

async function removeUploadedLogo() {
    if (confirm('Yakin ingin menghapus logo upload?')) {
        websiteSettings.logoType = 'emoji';
        websiteSettings.logoImage = null;
        pendingLogoUpload = null;
        
        // Update in Supabase
        const { error } = await supabase
            .from('settings')
            .update({ 
                value: { 
                    logo: '⚛️', 
                    type: 'emoji', 
                    logoImage: null 
                } 
            })
            .eq('key', 'logo');
        
        if (error) {
            console.error('Error removing logo:', error);
            alert('Gagal menghapus logo!');
            return;
        }
        
        // Hide preview
        document.getElementById('logoUploadPreview').classList.add('hidden');
        document.getElementById('logoAppliedPreview').classList.add('hidden');
        document.getElementById('logoFileInput').value = '';
        
        // Update all logos back to emoji
        updateAllLogos();
        
        showSuccessMessage('Logo upload berhasil dihapus!');
    }
}

async function removeUploadedBackground() {
    if (confirm('Yakin ingin menghapus background upload?')) {
        websiteSettings.backgroundType = 'gradient';
        websiteSettings.backgroundImage = null;
        pendingBackgroundUpload = null;
        
        // Update in Supabase
        const { error } = await supabase
            .from('settings')
            .update({ 
                value: { 
                    background: 'gradient-blue', 
                    type: 'gradient', 
                    backgroundImage: null,
                    customGradient: null
                } 
            })
            .eq('key', 'background');
        
        if (error) {
            console.error('Error removing background:', error);
            alert('Gagal menghapus background!');
            return;
        }
        
        // Hide preview
        document.getElementById('backgroundUploadPreview').classList.add('hidden');
        document.getElementById('backgroundAppliedPreview').classList.add('hidden');
        document.getElementById('backgroundFileInput').value = '';
        
        // Update all backgrounds back to gradient
        updateAllBackgrounds();
        updateBackgroundPreview();
        
        showSuccessMessage('Background upload berhasil dihapus!');
    }
}

function showSuccessMessage(message) {
    // Create temporary success message
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 bounce-in';
    successDiv.innerHTML = `
        <div class="flex items-center space-x-2">
            <span>✅</span>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('fixed') && e.target.classList.contains('inset-0')) {
        const modals = ['addMateriModal', 'addKelasModal', 'addJurnalModal'];
        modals.forEach(modalId => {
            if (e.target.id === modalId) {
                closeModal(modalId);
            }
        });
    }
});
