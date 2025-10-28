# Educator Features - Quick Start Guide 🚀

## Getting Started

### Prerequisites
- Supabase project configured
- User authenticated as an educator
- Environment variables set (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

---

## Step 1: Start the Development Server

```bash
npm run dev
```

Navigate to `http://localhost:3000`

---

## Step 2: Sign In as an Educator

1. Go to `/auth`
2. Sign in with an existing account OR create a new one
3. Select "Educator" role when prompted
4. You'll be redirected to `/educator/dashboard`

---

## Step 3: Create Your First Course

### Navigate to Course Creation
- From dashboard, click **"Create Course"** button
- Or go directly to `/educator/courses/create`

### Fill in Basic Information

**Required:**
- **Course Title:** e.g., "Complete Web Development Bootcamp 2024"
- Click "Save Draft" (other fields are optional for now)

**Optional but Recommended:**
- **Subtitle:** "From Zero to Full-Stack Developer"
- **Category:** Select "Web Development"
- **Level:** Choose "Beginner" 
- **Price:** Enter 49.99 (or 0 for free)
- **Description:** Use the rich text editor to write a compelling description
  - Try the formatting buttons (bold, italic, lists)
  - Add a link or embed a YouTube video
- **Thumbnail:** Upload a course cover image (max 5MB)

**Learning Objectives:**
- Click "+ Add Objective" to add more
- Example: "Build 5 real-world projects"
- Example: "Master HTML, CSS, and JavaScript"

**Requirements:**
- Example: "Basic computer skills"
- Example: "No prior coding experience needed"

**Target Audience:**
- Example: "Aspiring web developers"
- Example: "Career changers"

### Save and Continue
- Click **"Save & Continue to Curriculum"**
- You'll be redirected to the curriculum builder

---

## Step 4: Build Course Curriculum

### Add Your First Section

1. Click **"Add Section"** button
2. Enter section details:
   - **Title:** "Introduction to Web Development"
   - **Description:** "Getting started with the basics"
3. Click **"Save Section"**
4. Section appears in the list - click to expand it

### Add Your First Lesson

1. Inside the expanded section, click **"Add Lesson"**
2. Fill in lesson details:
   - **Title:** "Welcome to the Course"
   - **Description:** "Course overview and what to expect"
   - **Video:** Click to upload a video file (or skip for now)
   - **Content:** Use the rich text editor to write lesson content
   - **Duration:** 5 (minutes)
   - **Free Preview:** Check this box (makes it accessible to non-enrolled students)
3. Click **"Save Lesson"**

### Add More Content

**Add another lesson to the same section:**
1. Click **"Add Lesson"** again
2. Title: "Setting Up Your Development Environment"
3. Upload a video tutorial
4. Duration: 15
5. Save

**Add a second section:**
1. Collapse the first section (click the chevron)
2. Click **"Add Section"** at the top
3. Title: "HTML Fundamentals"
4. Save and add lessons to this section

### Recommended Structure
```
Section 1: Introduction
├── Lesson 1: Welcome (Preview)
└── Lesson 2: Setup Instructions

Section 2: HTML Fundamentals  
├── Lesson 3: HTML Basics
├── Lesson 4: HTML Elements
└── Lesson 5: HTML Forms

Section 3: CSS Styling
├── Lesson 6: CSS Introduction
└── Lesson 7: Flexbox Layout
```

---

## Step 5: Edit Course Details (Optional)

From the curriculum page:
1. Click **"Edit Details"** button (top right)
2. Update any course information
3. Change thumbnail
4. Modify objectives or requirements
5. Click **"Save Changes"**

---

## Step 6: Publish Your Course

1. From the curriculum builder page
2. Review all sections and lessons
3. Click **"Publish Course"** button (top right)
4. Confirm the publication
5. Course is now live and visible to learners! 🎉

---

## Step 7: View Your Course

### From Dashboard
1. Go to `/educator/dashboard`
2. See your course in "Recent Course Activity"
3. View stats:
   - Total students: 0 (initially)
   - Revenue: $0
   - Active courses: 1

### From Courses Page
1. Go to `/educator/courses`
2. See your published course in the grid
3. Use search and filters
4. Click "Edit" to return to curriculum

---

## Testing File Uploads

### Upload a Course Thumbnail
1. In course creation/edit page
2. Drag & drop an image OR click to browse
3. Supported formats: JPG, PNG, WebP, GIF
4. Max size: 5MB
5. Image uploads to `course-thumbnails` bucket
6. Preview appears after successful upload

### Upload a Video Lesson
1. In lesson creation/edit modal
2. Drag & drop a video file
3. Supported formats: MP4, WebM, MOV
4. Max size: 500MB (be patient for large files!)
5. Progress bar shows upload status
6. Video uploads to `course-videos` bucket

---

## Testing Rich Text Editor

In course description or lesson content:

1. **Text Formatting:**
   - Type some text
   - Select it and click Bold/Italic

2. **Lists:**
   - Click bullet list icon
   - Type items, press Enter for new items

3. **Add a Link:**
   - Click link icon
   - Enter URL (e.g., https://example.com)
   - Click "Add Link"

4. **Embed YouTube:**
   - Click YouTube icon
   - Enter video URL
   - Video embeds in the editor

5. **Add Image:**
   - Click image icon
   - Enter image URL
   - Image appears inline

---

## Managing Courses

### Edit Existing Course
1. Go to `/educator/courses`
2. Find your course
3. Click "Edit" button
4. Opens curriculum builder
5. Click "Edit Details" for basic info

### Add More Sections/Lessons
1. In curriculum builder
2. Click "Add Section" for new topics
3. Expand section and "Add Lesson"
4. Drag handles (for future reordering feature)

### Delete a Lesson
1. Expand section
2. Find lesson
3. Click trash icon
4. Confirm deletion
5. Lesson removed (cascades to materials)

### Delete a Section
1. Find section
2. Click trash icon on section
3. Confirm deletion
4. Section AND all its lessons removed

### Delete a Course
1. Go to edit page (`/educator/courses/[id]/edit`)
2. Click "Delete Course" button
3. Confirm deletion
4. Course and ALL content removed
5. Redirects to courses page

---

## Verifying Database

### Check Supabase Tables

You can verify data is being saved:

1. **Courses Table:**
   - Your course appears with status "draft" or "published"
   - All fields populated correctly

2. **Course Sections Table:**
   - Sections linked to your course
   - Order index correct (0, 1, 2...)

3. **Course Lessons Table:**
   - Lessons linked to sections
   - Video URLs present
   - Order index correct

4. **Storage Buckets:**
   - `course-thumbnails`: Your uploaded images
   - `course-videos`: Your uploaded videos
   - Files accessible via public URLs

---

## Common Workflows

### Quick Course Creation
```
1. Create course (title only) → Save
2. Add 1 section → Save
3. Add 1 lesson (text only) → Save
4. Publish → Done!
```

### Full Course Creation
```
1. Create course (all details, thumbnail) → Save
2. Add 5-10 sections → Save each
3. For each section:
   - Add 3-5 lessons
   - Upload videos
   - Write detailed content
   - Set 1-2 as preview
4. Review everything
5. Publish → Done!
```

### Update Published Course
```
1. Find course → Edit
2. Click "Edit Details" → Update info
3. Go back to curriculum
4. Edit lessons (add/modify/delete)
5. Changes save automatically
6. Course stays published
```

---

## Tips for Best Experience

### Content Creation
- ✅ Write clear, concise lesson titles
- ✅ Use preview lessons to attract learners
- ✅ Set accurate duration times
- ✅ Upload high-quality thumbnails
- ✅ Write compelling course descriptions

### Organization
- ✅ Group related lessons in sections
- ✅ Keep sections focused (3-7 lessons each)
- ✅ Order from beginner to advanced
- ✅ Use descriptive section titles

### Media
- ✅ Compress videos before upload
- ✅ Use 16:9 aspect ratio for videos
- ✅ Optimize thumbnail images
- ✅ Test video playback after upload

### Publishing
- ✅ Have at least 3 sections
- ✅ Minimum 10 lessons recommended
- ✅ Include at least 1 preview lesson
- ✅ Complete all course details
- ✅ Review content before publishing

---

## Troubleshooting

### Issue: "Failed to save course"
**Solution:**
- Check you're logged in
- Verify course title is not empty
- Check browser console for errors

### Issue: "Upload failed"
**Solution:**
- Check file size (under limits?)
- Verify file type is supported
- Try smaller file or different format
- Check internet connection

### Issue: "Can't see my course"
**Solution:**
- Check you're on the right account
- Verify course was saved (check database)
- Try refreshing the page
- Check filter settings (All/Published/Draft)

### Issue: "Published course not showing to learners"
**Solution:**
- Verify status is "published" (not "draft")
- Check RLS policies are correct
- Learner should see it in browse page (when implemented)

---

## What's Next?

After creating educator features, you can:

1. **Implement Learner Features:**
   - Browse courses
   - Enroll in courses
   - Watch lessons
   - Track progress

2. **Add AI Task Planner:**
   - Generate study schedules
   - Auto-create tasks from courses
   - Smart reminders

3. **Add Payment Integration:**
   - Stripe/PayPal for course purchases
   - Revenue tracking
   - Payouts to educators

4. **Enhance Educator Tools:**
   - Analytics dashboard
   - Student management
   - Q&A system
   - Certificates

---

## Congratulations! 🎊

You now have a fully functional course creation system. Start creating amazing courses and help learners achieve their goals!

Happy teaching! 📚✨

