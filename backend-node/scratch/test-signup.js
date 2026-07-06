async function testSignup() {
  const email = `rehan98178+test${Math.floor(Math.random() * 10000)}@gmail.com`; // use user's email prefix to test actual email receipt
  console.log(`Sending test signup request for: ${email}`);

  try {
    const res = await fetch('http://localhost:5001/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: 'TestPassword123'
      })
    });

    const data = await res.json();
    console.log('Response Status:', res.status);
    console.log('Response Data:', data);
  } catch (err) {
    console.error('Error sending request:', err.message);
  }
}

testSignup();
