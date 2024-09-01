## MVP personal use

### Job page

Job loads at /job/:id including title, description, and url
If no job order, automatically activate "order with AI"
If job order exists, experiences/bullets are displayed in that order
Experiences are set in a fixed order (for now)
Every bullet rearrange, it is preserved on the backend
Once the "drag" is done, a call to the backend (update job) with the current structure.
Submit is prevented until all the experiences have 

## Data

users
experiences
bullets
jobs

User has many experiences. Experience has many bullets.
User has many jobs.

What to do with "order". Should be related to job at the very least.
Perhaps order should be a separate entity. Alternatively, it could be stored on a job.

Stored on job:
New field "order"
Could be an object where keys are experience ids and values are arrays of bullet ids

## Personal Use

For now put a user id on experiences. at /job/:id


## Future Features

Resume (left column) should have vertically stacked rows
Make bullets have types (career vs knowledge)
Make knowledge bullets have aliases (ie HTML5 and HTML)