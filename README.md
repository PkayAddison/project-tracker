# Project Navigator

Build "PROJECT & INITIATIVE TRACKER", a simple, modern, and easy-to-use web application for teams, schools, and organizations to plan, assign, monitor, and report on projects.

Include:

1. Role-based Experience: Admin (full CRUD, manage settings/team, export all reports) and Team Member (view assigned tasks, submit fast progress updates) with a convenient role switcher in the header.

2. Dashboard: Overview cards (Total, Active, Completed Projects; Total, Completed, In-Progress, Overdue Tasks), Project Progress cards with percentage bars, Upcoming Deadlines, Overdue Tasks alert list, and Recent Progress Updates feed.

3. Projects Management: Project listings and dedicated Project Details pages. Fields: Name, Description, Objective, Project Lead, Committee/Department, Team Members, Start Date, Target Date, Priority (Low/Med/High), Status (Planning, Not Started, In Progress, On Hold, Completed, Cancelled). Detail page shows meta, tasks table with search/filter/sort, progress bars, and audit timeline.

4. Tasks & Action Items: Title, Description, Project, Assignee, Supporting Members, Start & Due Dates, Priority, Status, Percentage Complete (0-100% progress bar), Challenges, Next Action, Next Review Date. Auto-flag overdue tasks when past due date and <100%.

5. Fast Progress Update System: Simple modal to submit updates in under 30 seconds (Status, % Complete, Progress Made, Challenges/Issues, Support Required, Next Action, Expected Date, Next Update Date). Saves immutable chronological progress history displayed as a clean timeline.

6. Committees / Departments: Management of organizational units (Academic, ICT, Events, Admin, Marketing, etc.) linked to projects and members.

7. Team Directory: Team members list with role, email, department, and live task count badges (assigned, in-progress, completed, overdue).

8. Calendar / Deadlines: Calendar view displaying task deadlines, project targets, and review dates with visual status indicators (green = completed, normal = upcoming, red = overdue).

9. Reports & PDF Export:

   - One-page Project Progress Summary

   - Team Progress Report

   - Overdue Tasks Report

   - Progress Update Log (date-range filtered)

   - Real formatted PDF export (using jsPDF / autoTable / html2pdf) with organization logo, name, reporting period, custom footer, page numbering, and table formatting.

   - Quick "Print Report" option.

10. Settings: Organization branding (Name, Logo upload/preview, Address, Email, Phone, Report Footer), committees setup, and sample data reset.

11. Sample Data: Realistic pre-populated data (Website Development with overdue items, School Events Planning, ICT Infrastructure Upgrade, Academic Improvement Initiative) ready for immediate testing.

12. Styling & Usability: Responsive sidebar layout, crisp corporate blue and gold accents, clean empty states, friendly validation, and instant modal forms for creating projects and tasks in under 2 minutes.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e0d566c5-becf-4985-8e52-d348643e7c15).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
