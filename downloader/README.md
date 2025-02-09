# X-Bookmarks Exporter

A service to export and manage bookmarks from X (formerly Twitter).

## Database Management with Prisma

This project uses Prisma as the ORM for managing PostgreSQL database operations. Here's how to work with it:

### Setup

1. Install dependencies:

```bash
npm install
```

2. Set up your database URL in `.env`:

```
DATABASE_URL="postgresql://username:password@localhost:5432/your_database"
```

3. Generate Prisma Client:

```bash
npx prisma generate
```

### Database Operations

#### Using Prisma Studio

To view and edit your database through a GUI:

```bash
npx prisma studio
```

#### Making Schema Changes

1. Edit the schema in `prisma/schema.prisma`
2. Create and apply migrations:

```bash
npx prisma migrate dev
```

### Current Schema

The database currently has a `BookmarkedTweet` model with the following structure:

```prisma
model BookmarkedTweet {
  tweetId              String    @id @map("tweet_id")
  url                  String
  fullText            String?   @map("full_text")
  timestamp           DateTime?
  mediaType           String?   @map("media_type")
  mediaSource         String?   @map("media_source")
  authorName          String?   @map("author_name")
  authorScreenName    String?   @map("author_screen_name")
  authorProfileImageUrl String? @map("author_profile_image_url")
  createdAt           DateTime  @default(now()) @map("created_at")
}
```

### Example Usage

```javascript
// Create a new bookmark
const bookmark = await prisma.bookmarkedTweet.create({
  data: {
    tweetId: '123456',
    url: 'https://twitter.com/user/status/123456',
    fullText: 'Tweet content',
    authorName: 'User Name',
  },
});

// Find bookmarks by author
const bookmarks = await prisma.bookmarkedTweet.findMany({
  where: {
    authorScreenName: 'username',
  },
});

// Get a specific bookmark
const tweet = await prisma.bookmarkedTweet.findUnique({
  where: {
    tweetId: '123456',
  },
});
```

### Best Practices

1. Always use the Prisma Client for database operations
2. Remember to handle database connections properly:
   - The client is initialized once at app startup
   - Disconnect on app shutdown (already configured in `index.js`)
3. Use transactions for operations that require multiple database changes
4. Leverage Prisma's built-in type safety with TypeScript (if using TS)

## Running the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000` by default.

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->
