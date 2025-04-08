import mongoose, { Schema, Document } from 'mongoose';

interface IAddress {
    title: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

interface IUser extends Document {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: 'user' | 'admin' | 'moderator';
    phone: string;
    addresses: IAddress[];
    wishlist: mongoose.Schema.Types.ObjectId[];
    orders: mongoose.Schema.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    lastLogin: Date;
    isActive: boolean;
    verificationToken: string;
    resetPasswordToken: string;
    resetPasswordExpires: Date;
    language: string;
}

const AddressSchema: Schema = new Schema({
    title: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
});

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
    phone: { type: String },
    addresses: [AddressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    language: { type: String, default: 'tr' }
});

export default mongoose.model<IUser>('User', UserSchema);