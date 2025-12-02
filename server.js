const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

// --- FIX IS HERE: Increase payload limit to 50MB ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// ---------------------------------------------------

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

// ... (Rest of your Schemas and Routes remain the same) ...

const UserSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  role: String,
  headline: String,
  about: String,
  skills: [String],
  location: String,
  avatar: String,
  profileViewers: { type: Number, default: 0 }
});

const PostSchema = new mongoose.Schema({
  id: String,
  authorId: String,
  authorName: String,
  authorHeadline: String,
  authorAvatar: String,
  content: String,
  image: String,
  timestamp: Number,
  likes: { type: Number, default: 0 },
  likedBy: [String],
  comments: { type: Number, default: 0 },
  commentsList: [{
    id: String,
    authorId: String,
    authorName: String,
    authorAvatar: String,
    text: String,
    timestamp: Number
  }]
});

const MessageSchema = new mongoose.Schema({
  id: String,
  senderId: String,
  receiverId: String,
  text: String,
  sharedPostId: String,
  image: String,
  isSystem: Boolean,
  timestamp: Number
});

const ConnectionSchema = new mongoose.Schema({
  id: String,
  requesterId: String,
  recipientId: String,
  status: String,
  timestamp: Number
});

const NotificationSchema = new mongoose.Schema({
  id: String,
  userId: String,
  senderId: String,
  senderName: String,
  senderAvatar: String,
  type: String,
  postId: String,
  read: Boolean,
  timestamp: Number
});

const CallSchema = new mongoose.Schema({
  id: String,
  callerId: String,
  receiverId: String,
  type: String,
  status: String,
  startTime: Number,
  endTime: Number
});

const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);
const Message = mongoose.model('Message', MessageSchema);
const Connection = mongoose.model('Connection', ConnectionSchema);
const Notification = mongoose.model('Notification', NotificationSchema);
const Call = mongoose.model('Call', CallSchema);

// --- Routes ---

// Users
app.get('/api/users', async (req, res) => res.json(await User.find()));
app.post('/api/users', async (req, res) => {
  const exists = await User.findOne({ email: req.body.email });
  if (exists) return res.json(exists);
  const newUser = new User(req.body);
  await newUser.save();
  res.json(newUser);
});

// Posts
app.get('/api/posts', async (req, res) => res.json(await Post.find().sort({ timestamp: -1 })));
app.post('/api/posts', async (req, res) => {
  const newPost = new Post(req.body);
  await newPost.save();
  res.json(newPost);
});
app.put('/api/posts/:id', async (req, res) => {
  const updated = await Post.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
  res.json(updated);
});

// Messages
app.get('/api/messages', async (req, res) => res.json(await Message.find()));
app.post('/api/messages', async (req, res) => {
  const msg = new Message(req.body);
  await msg.save();
  res.json(msg);
});

// Connections
app.get('/api/connections', async (req, res) => res.json(await Connection.find()));
app.post('/api/connections', async (req, res) => {
  const conn = new Connection(req.body);
  await conn.save();
  res.json(conn);
});
app.put('/api/connections/:id', async (req, res) => {
  const updated = await Connection.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
  res.json(updated);
});

// Notifications
app.get('/api/notifications', async (req, res) => res.json(await Notification.find().sort({ timestamp: -1 })));
app.post('/api/notifications', async (req, res) => {
  const notif = new Notification(req.body);
  await notif.save();
  res.json(notif);
});
app.put('/api/notifications/read/:userId', async (req, res) => {
  await Notification.updateMany({ userId: req.params.userId }, { read: true });
  res.json({ success: true });
});

// Calls
app.get('/api/calls', async (req, res) => res.json(await Call.find()));
app.post('/api/calls', async (req, res) => {
  const call = new Call(req.body);
  await call.save();
  res.json(call);
});
app.put('/api/calls/:id', async (req, res) => {
  const updated = await Call.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
  res.json(updated);
});

app.listen(5000, () => console.log('Server running on port 5000'));