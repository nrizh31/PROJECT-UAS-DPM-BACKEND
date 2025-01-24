const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username minimal 3 karakter']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Format email tidak valid']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password minimal 6 karakter']
    },
    nama: {
        type: String,
        required: [true, 'Nama is required'],
        trim: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'user',
    timestamps: true
});

// Pre-save hook untuk hash password
userSchema.pre('save', async function(next) {
    try {
        if (!this.isModified('password')) {
            return next();
        }

        console.log('Hashing password for:', this.email);
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        console.log('Password hashed successfully');
        next();
    } catch (error) {
        console.error('Error hashing password:', error);
        next(error);
    }
});

// Method verifikasi password
userSchema.methods.verifyPassword = async function(candidatePassword) {
    try {
        console.log('Verifying password for user:', this.email);
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log('Password verification result:', isMatch);
        return isMatch;
    } catch (error) {
        console.error('Password verification error:', error);
        throw error;
    }
};

// Method untuk mendapatkan info user tanpa password
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;