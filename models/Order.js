const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderNumber: { type: String, required: true },
    transactionId: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'rejected'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);