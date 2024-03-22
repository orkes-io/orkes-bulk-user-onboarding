# Orkes Bulk User Onboarding
This utility calls Orkes APIs to bulk onboard users by loading details from a CSV file. It will use credentials of an existing logged-in admin user rather than an application account.

## Pre-requisites
* NodeJS

## Installation
```bash
$ npm i
```
## Usage
### Prepare the CSV file based on the template provided

Save the file as `users.csv` in the same directory.
| id           | name       | roles                  | groups                  |
|--------------|------------|------------------------|-------------------------|
|john@xyz.com  | John Doe   | user                   | Some Group, Other Group |
|anne@xyz.com  | Anne Smith | admin                  | Another Group           |
|martin@xyz.com| Martin Lee | user,metadata_manager  | Another Group           |

The `roles` and `groups` fields can include multiple items by separating them with commas.

The `roles` field can only comprise the following names (case insensitive):
- `ADMIN`
- `USER`
- `METADATA_MANAGER`
- `WORKFLOW_MANAGER`
- `USER_READ_ONLY`

### Prepare Configuration
Login to the Orkes cluster as an admin user and click on the "**Copy Token**" button in the left navigation below the email address. Paste it into the console when entering the `ORKES_TOKEN`.
```bash
export ORKES_URI=https://your-cluster.orkesconductor.io/api
export ORKES_TOKEN=eyJh..vIQ
```

### Onboard Users
```bash
$ node index.js
```
Ensure successful save for all entries:
```bash
==========================
Orkes Bulk User Onboarding
==========================
Reading CSV input from: users.csv
CSV file successfully processed: 3 rows read

User saved: John Doe (john@xyz.com)
User saved: Anne Smith (anne@xyz.com)
User saved: Martin Lee (martin@xyz.com)
```

### Offboard Users
```bash
$ node index.js offboard
```

Ensure successful deletion for all entries:
```bash
===========================
Orkes Bulk User Offboarding
===========================
Reading CSV input from: users.csv
CSV file successfully processed: 3 rows read

User deleted: John Doe (john@xyz.com)
User deleted: Anne Smith (anne@xyz.com)
User deleted: Martin Lee (martin@xyz.com)
```