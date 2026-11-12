EUN CREATIVES — VIDEO EDITING PORTFOLIO
=======================================

WHAT'S INCLUDED
- index.html: page structure (hero, work, services, contact, video player)
- style.css: cinematic design — navy + orange, film grain, animated glow
- script.js: your project list + gallery, filters, and click-to-play player
- videos/            : your ORIGINAL video files (ProRes/HEVC/large — kept as-is)
- videos/web/        : web-friendly H.264 MP4s the site actually plays
- videos/thumbs/     : poster thumbnails shown on each card
- convert.sh         : the script that made videos/web + videos/thumbs

IMPORTANT — WHY THERE ARE TWO VIDEO FOLDERS
- Browsers (Chrome, Edge, Firefox) can ONLY play H.264 MP4. Most of your
  originals are ProRes or HEVC inside .mov files, which those browsers refuse
  to play — that's why videos "didn't show" at first.
- So the site plays the small H.264 copies in videos/web/ (a few MB each) and
  shows a real photo thumbnail from videos/thumbs/. Your big originals stay
  untouched in videos/ as your master copies.

HOW YOUR VIDEOS SHOW UP (click-to-play)
- Each project is a card with its real thumbnail + a play button. Tapping a
  card opens the video full-screen. Nothing downloads until someone taps.

HOW TO EDIT YOUR PROJECTS (titles, categories, order)
1. Open script.js and find the PROJECTS list at the top.
2. Each line is one card, for example:
     { file:'royce #1.mp4', web:'web/clip-02.mp4', thumb:'thumbs/clip-02.jpg',
       title:'Creator Edit — Royce', cat:'ugc', dur:'0:31' },
   - file   : your original in videos/ (reference only)
   - web    : the H.264 clip in videos/web/ that actually plays
   - thumb  : the poster image in videos/thumbs/
   - title  : the caption under the clip — rename freely
   - cat    : category key (short, long, heads, ugc, ai, gaming)
   - dur    : length shown on the card (optional, cosmetic)
3. Categories and card colors live in the CATEGORIES list above PROJECTS.

ADDING A NEW VIDEO
1. Put the file in videos/.
2. Convert it for the web (needs ffmpeg). Example:
     ffmpeg -i "videos/yourclip.mov" -vf "scale=1280:1280:force_original_aspect_ratio=decrease" \
       -c:v libx264 -pix_fmt yuv420p -crf 26 -preset fast -movflags +faststart \
       -c:a aac -b:a 128k videos/web/clip-15.mp4
   (see convert.sh for the exact recipe used for the current clips)
3. Make a thumbnail:
     ffmpeg -y -ss 1 -i videos/web/clip-15.mp4 -frames:v 1 -vf scale=480:-2 videos/thumbs/clip-15.jpg
4. Add a line to PROJECTS pointing web: 'web/clip-15.mp4', thumb: 'thumbs/clip-15.jpg'.

CONTACT + STATS
- Replace euncreatives@gmail.com in index.html (search for it) with your email.
- The four hero numbers (projects, views, creators, years) are in index.html —
  change the data-count values to your real numbers.

HOW TO PREVIEW
- Open index.html in a browser, or use VS Code's Live Server.

HOW TO PUBLISH FOR FREE WITH NETLIFY
1. Go to https://app.netlify.com/drop
2. Sign in or create a free Netlify account.
3. Drag the whole folder (index.html, style.css, script.js, videos/) in.
4. Netlify gives you a .netlify.app URL.
- The videos/web/ + videos/thumbs/ copies are small enough to publish easily.
  You can leave the big originals in videos/ out of the deploy if you prefer.


