const bcrypt = require('bcrypt');

const testPassword = async () => {
    const password = 'sumatra';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword);

    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log('Password match:', isMatch);
};

testPassword();