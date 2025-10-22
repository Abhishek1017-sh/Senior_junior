const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with Google ID
        let user = await User.findOne({ 'socialLogins.googleId': profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with the same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account to existing user
          user.socialLogins.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          username: profile.emails[0].value.split('@')[0] + '_' + Date.now(),
          email: profile.emails[0].value,
          password: Math.random().toString(36).slice(-8), // Random password (won't be used)
          profile: {
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            profilePictureUrl: profile.photos[0]?.value,
          },
          socialLogins: {
            googleId: profile.id,
          },
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
)};

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ['user:email'],
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with GitHub ID
        let user = await User.findOne({ 'socialLogins.githubId': profile.id });

        if (user) {
          return done(null, user);
        }

        // Get email from profile
        const email = profile.emails && profile.emails[0]?.value;

        if (email) {
          // Check if user exists with the same email
          user = await User.findOne({ email });

          if (user) {
            // Link GitHub account to existing user
            user.socialLogins.githubId = profile.id;
            await user.save();
            return done(null, user);
          }
        }

        // Create new user
        const displayName = profile.displayName || profile.username;
        const nameParts = displayName.split(' ');

        user = await User.create({
          username: profile.username || 'user_' + Date.now(),
          email: email || `${profile.username}@github.local`,
          password: Math.random().toString(36).slice(-8), // Random password (won't be used)
          profile: {
            firstName: nameParts[0] || profile.username,
            lastName: nameParts.slice(1).join(' ') || '',
            profilePictureUrl: profile.photos[0]?.value,
            bio: profile._json.bio || '',
          },
          socialLogins: {
            githubId: profile.id,
          },
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
)};

module.exports = passport;
