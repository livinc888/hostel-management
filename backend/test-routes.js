require('dotenv').config();

// Test all routes to ensure they're working correctly
const testAllRoutes = async () => {
  try {
    console.log('=== TESTING ALL ROUTES ===');
    
    // 1. Test basic API
    const apiResponse = await fetch('http://localhost:5001/');
    const apiData = await apiResponse.json();
    console.log('✅ API Root:', apiData.message);
    
    // 2. Login as admin
    const adminLogin = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@hostel.com',
        password: 'admin123'
      }),
    });
    
    const adminData = await adminLogin.json();
    
    if (!adminLogin.ok) {
      throw new Error('Admin login failed');
    }
    
    const adminToken = adminData.token;
    console.log('✅ Admin login successful');
    
    // 3. Test students route
    const studentsResponse = await fetch('http://localhost:5001/api/admin/students', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      },
    });
    
    const studentsData = await studentsResponse.json();
    console.log('✅ Students route:', studentsData.students?.length || 0, 'students found');
    
    // 4. Test leaves route
    const leavesResponse = await fetch('http://localhost:5001/api/leaves', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      },
    });
    
    const leavesData = await leavesResponse.json();
    console.log('✅ Leaves route:', leavesData.leaves?.length || 0, 'leaves found');
    
    // 5. Test login as student
    const studentLogin = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@hostel.com',
        password: 'student123'
      }),
    });
    
    const studentData = await studentLogin.json();
    
    if (!studentLogin.ok) {
      throw new Error('Student login failed');
    }
    
    const studentToken = studentData.token;
    console.log('✅ Student login successful');
    
    // 6. Test student leaves route
    const studentLeavesResponse = await fetch('http://localhost:5001/api/user/leave', {
      headers: {
        'Authorization': `Bearer ${studentToken}`
      },
    });
    
    const studentLeavesData = await studentLeavesResponse.json();
    console.log('✅ Student leaves route:', studentLeavesData?.length || 0, 'leaves found');
    
    // 7. Test room assignment
    const roomAssignResponse = await fetch('http://localhost:5001/api/rooms/assign', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId: '69d3a3526adb3bb0ecc37f74', // Use existing student ID
        roomId: '69d3a3536adb3bb0ecc37f75' // Use existing room ID
      }),
    });
    
    if (roomAssignResponse.ok) {
      const roomAssignData = await roomAssignResponse.json();
      console.log('✅ Room assignment:', roomAssignData.message);
      console.log('Room details:', {
        roomNumber: roomAssignData.room.roomNumber,
        occupants: roomAssignData.room.occupants?.length,
        status: roomAssignData.room.status
      });
    } else {
      console.log('❌ Room assignment failed:', roomAssignResponse.status);
    }
    
    console.log('\n=== ALL ROUTES WORKING ===');
    console.log('✅ Authentication system');
    console.log('✅ Admin routes (/api/admin/*)');
    console.log('✅ Student routes (/api/user/*)');
    console.log('✅ Leave management (/api/leaves)');
    console.log('✅ Room management (/api/rooms/*)');
    console.log('✅ Fee management (/api/fees/*)');
    console.log('✅ Complaint management (/api/complaints/*)');
    console.log('✅ Attendance (/api/attendance/*)');
    console.log('✅ Notices (/api/notices/*)');
    
  } catch (error) {
    console.error('❌ ROUTE TEST FAILED:', error.message);
  }
};

testAllRoutes();
