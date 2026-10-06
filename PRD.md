# Product Requirements Document

**Project:** Placement Prep Portal  
**Team:** SA3  
**Version:** 1.0 · Hackathon Build  
**Related:** [TRD.md](./TRD.md) · [README.md](./README.md)

---

## Executive Summary

The Placement Prep Portal is a web application that gives students a single authenticated workspace to manage their entire campus placement journey — applications, interview stages, and preparation resources — replacing fragmented spreadsheets and notes.

Scoped for a **2-hour hackathon build**: MVP-first, with bounded bonus features.

---

## Problem

Students track multiple simultaneous applications with no central tool:

- Application status gets lost across spreadsheets and chat messages.
- No single view of overall progress (applied vs. selected vs. rejected).
- Prep resources (DSA, aptitude, resume tips, interview experiences) are scattered.

**Goal:** One secure, personal workspace — track applications end-to-end, access categorized resources.

---

## Users

| User | Need |
|---|---|
| Student (primary) | Track applications, monitor status, access prep resources |
| Placement Cell | Aggregate visibility across students *(future scope, not in MVP)* |

---

## Goals & Non-Goals

**In scope (MVP)**
- Secure individual accounts (register / login)
- Full CRUD for company applications with status lifecycle
- Dashboard summary of application counts
- Search and filter across applications
- Categorized preparation resource library

**Out of scope**
- Kalvium belt / attendance / communication-score integration
- Multi-user collaboration or faculty-facing views
- Real-time notifications or email reminders
- Native mobile app (responsive web only)
- Resume parsing or automated scoring

---

## Functional Requirements

### Authentication

| ID | Requirement | Priority |
|---|---|---|
| AUTH-1 | Register with name, email, password | Must |
| AUTH-2 | Login with email / password | Must |
| AUTH-3 | Sessions secured via JWT | Must |
| AUTH-4 | All data routes inaccessible without a valid token | Must |
| AUTH-5 | Passwords never stored or transmitted in plain text | Must |

### Dashboard

| ID | Requirement | Priority |
|---|---|---|
| DASH-1 | Total companies applied | Must |
| DASH-2 | Active (in-progress) applications | Must |
| DASH-3 | Total selected offers | Must |
| DASH-4 | Total rejections | Must |

### Company Application Tracker

| ID | Requirement | Priority |
|---|---|---|
| APP-1 | Add a company (name, role, applied date, status) | Must |
| APP-2 | View all tracked applications | Must |
| APP-3 | Update an application (e.g., change status) | Must |
| APP-4 | Delete an application | Must |
| APP-5 | Status enum: `Applied`, `Online Assessment`, `Technical Interview`, `HR Interview`, `Selected`, `Rejected` | Must |

### Search & Filter

| ID | Requirement | Priority |
|---|---|---|
| SRCH-1 | Search by company name | Must |
| SRCH-2 | Filter by status | Must |

### Preparation Resources

| ID | Requirement | Priority |
|---|---|---|
| RES-1 | View resources (title, category, link) | Must |
| RES-2 | Add a new resource | Must |
| RES-3 | Categories: `DSA`, `Aptitude`, `Resume`, `Interview Experience`, `Core Subjects` | Must |

---

## User Stories

- As a student, I want to register and log in securely so my data stays private.
- As a student, I want to add a company the moment I apply so I never lose track of it.
- As a student, I want to update an application's status as I progress through rounds.
- As a student, I want a dashboard so I can see my overall progress at a glance.
- As a student, I want to search and filter applications to find a company or status quickly.
- As a student, I want a categorized resource list so I can find prep material without hunting.

---

## Success Metrics (Hackathon Context)

- All "Must" requirements (AUTH, DASH, APP, SRCH, RES) work end-to-end.
- No plain-text password storage or exposed secrets.
- At least 2 bonus features fully functional.
- Application runs locally without errors, following the README.

---

## Assumptions & Constraints

- Each student sees only their own applications; resources may be global/shared.
- Communication score, viva score, and belt data are out of scope.
- Built and evaluated within a 2-hour window; feature completeness over polish.

---

*This PRD defines **what** is being built and **why**. See [TRD.md](./TRD.md) for **how** it is implemented.*
