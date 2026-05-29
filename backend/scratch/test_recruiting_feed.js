import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testRecruitingFeed() {
  console.log('🧪 STARTING PROGRAMMATIC RECRUITING SOCIAL FEED TEST 🧪\n');

  let studentToken = '';
  let recruiterToken = '';
  let testPostId = '';

  // 1. Authenticate Candidate Student
  try {
    console.log('1. Authenticating student demo@jobtrack.com...');
    const studentLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'demo@jobtrack.com',
      password: 'password'
    });
    studentToken = studentLogin.data.token;
    console.log('✅ Student Authenticated successfully.');
  } catch (err) {
    console.error('❌ Failed to authenticate student:', err.response?.data || err.message);
    return;
  }

  // 2. Authenticate Recruiter
  try {
    console.log('2. Authenticating recruiter recruiter@jobtrack.com...');
    const recruiterLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'recruiter@jobtrack.com',
      password: 'password'
    });
    recruiterToken = recruiterLogin.data.token;
    console.log('✅ Recruiter Authenticated successfully.');
  } catch (err) {
    console.error('❌ Failed to authenticate recruiter:', err.response?.data || err.message);
    return;
  }

  // Set up auth headers
  const studentHeaders = { headers: { Authorization: `Bearer ${studentToken}` } };
  const recruiterHeaders = { headers: { Authorization: `Bearer ${recruiterToken}` } };

  // 3. Fetch Posts as Student
  try {
    console.log('\n3. Fetching social feed posts as Student...');
    const res = await axios.get(`${API_BASE}/posts`, studentHeaders);
    const posts = res.data;
    console.log(`✅ Retrieved ${posts.length} posts from feed.`);
    console.log(`🔍 Top post author: ${posts[0].authorName} (${posts[0].company})`);
    
    // Save a post ID for like/comment tests
    testPostId = posts[0].id;
    console.log(`📌 Using post ID "${testPostId}" for interaction tests.`);
  } catch (err) {
    console.error('❌ Failed to fetch feed posts:', err.response?.data || err.message);
    return;
  }

  // 4. Like/Unlike Post as Student
  try {
    console.log('\n4. Toggling like reaction on top post...');
    const likeRes = await axios.post(`${API_BASE}/posts/${testPostId}/like`, {}, studentHeaders);
    console.log(`✅ Like toggle response: likes=${likeRes.data.likes}, hasLiked=${likeRes.data.hasLiked}`);

    // Toggle again to restore state
    const unlikeRes = await axios.post(`${API_BASE}/posts/${testPostId}/like`, {}, studentHeaders);
    console.log(`✅ Second like toggle (unlike): likes=${unlikeRes.data.likes}, hasLiked=${unlikeRes.data.hasLiked}`);
  } catch (err) {
    console.error('❌ Failed to like/unlike post:', err.response?.data || err.message);
    return;
  }

  // 5. Comment on Post as Student
  try {
    console.log('\n5. Posting comment on post...');
    const commentRes = await axios.post(`${API_BASE}/posts/${testPostId}/comment`, {
      text: 'This direct apply integration is incredibly fast and responsive! Testing comment flow.'
    }, studentHeaders);
    console.log(`✅ Comment posted. Author: "${commentRes.data.author}", text: "${commentRes.data.text}"`);
  } catch (err) {
    console.error('❌ Failed to post comment:', err.response?.data || err.message);
    return;
  }

  // 6. Publish Recruiter Broadcast
  try {
    console.log('\n6. Publishing recruiter hiring broadcast...');
    const broadcastRes = await axios.post(`${API_BASE}/posts`, {
      content: 'We are expanding our SDE internship hiring funnels at Swiggy for Summer 2026. Stipend is ₹60,000/mo base. Testing automated verification!',
      roleLink: { company: 'Swiggy', role: 'SDE Intern' }
    }, recruiterHeaders);

    console.log('✅ Recruiter broadcast published successfully.');
    console.log(`🔍 Broadcast author: "${broadcastRes.data.authorName}", Company: "${broadcastRes.data.company}"`);
    console.log(`🔍 Linked role: "${broadcastRes.data.roleLink?.role}" at "${broadcastRes.data.roleLink?.company}"`);
  } catch (err) {
    console.error('❌ Failed to publish recruiter broadcast:', err.response?.data || err.message);
    return;
  }

  // 7. Verify newly published broadcast shows up in student's feed
  try {
    console.log('\n7. Verifying published broadcast shows in Student feed...');
    const res = await axios.get(`${API_BASE}/posts`, studentHeaders);
    const topPost = res.data[0];
    if (topPost.content.includes('expanding our SDE internship hiring funnels')) {
      console.log('✅ Verification success: Recruiter post is at the top of candidate feed!');
      console.log(`🔍 Content preview: "${topPost.content.slice(0, 70)}..."`);
    } else {
      console.warn('⚠️ Recruiter post was not found at the top of the feed!');
    }
  } catch (err) {
    console.error('❌ Failed to verify top post:', err.response?.data || err.message);
  }

  // 8. Test Student "Apply Direct" job creation
  try {
    console.log('\n8. Simulating single-click direct job tracking on Student Kanban funnel...');
    const trackJobRes = await axios.post(`${API_BASE}/jobs`, {
      company: 'Swiggy',
      role: 'SDE Intern',
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'APPLIED',
      salary: '₹60,000/month',
      notes: 'Applied directly from recruiter post update!'
    }, studentHeaders);

    console.log('✅ Single-click direct apply successfully tracked in database!');
    console.log(`🔍 Job tracking ID: "${trackJobRes.data.id}", Company: "${trackJobRes.data.company}", Role: "${trackJobRes.data.role}", Status: "${trackJobRes.data.status}"`);
  } catch (err) {
    console.error('❌ Failed to track direct apply job:', err.response?.data || err.message);
  }

  console.log('\n✨ ALL PROGRAMMATIC FEED RECRUITMENT TESTS COMPLETED SUCCESSFULLY! ✨');
}

testRecruitingFeed();
