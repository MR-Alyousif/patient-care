# Patient Care Management System

A real-time prescription tracking system built for COE 427 Distributed Computing. This system demonstrates the implementation of a distributed system using RTI Connext DDS (Data Distribution Service) in a healthcare context.

## Project Overview

The Patient Care Management System is a comprehensive solution that connects doctors, patients, pharmacists, and a central display screen in real-time. The system uses DDS for reliable, real-time data distribution across all components.

### Key Components

1. **Doctor's Dashboard**
   - Generate unique prescription IDs
   - Create and submit prescriptions
   - Real-time status tracking

2. **Patient Interface**
   - Prescription verification
   - Ticket number generation
   - Status tracking

3. **Pharmacist Queue**
   - View incoming prescriptions
   - Process prescriptions
   - Update prescription status

4. **Central Display Screen**
   - Show ready prescriptions
   - Display "Now Serving" and "Up Next" tickets
   - Real-time updates

## Technical Implementation

### Technologies Used

- Next.js 14 (React Framework)
- TypeScript
- RTI Connext DDS
- Tailwind CSS
- Zod (Schema Validation)
- Framer Motion (Animations)

### DDS Implementation

- Uses RTI Connext DDS for real-time data distribution
- Implements reliable messaging with transient local durability
- Configured topics: PrescriptionTopic, TicketTopic
- Custom DDS connector with singleton pattern

## Getting Started

1. **Prerequisites**
   - Node.js 18+
   - RTI Connext DDS installation
   - DDS license (if required)

2. **Installation**

   ```bash
   # Clone the repository
   git clone https://github.com/MR-Alyousif/patient-care.git

   # Install dependencies
   npm install

   # Set up DDS environment
   # Follow the setup guide in 'docs/dds-setup.md'
   ```

3. **Running the Application**

   ```bash
   # Start the development server
   npm run dev

   # The application will be available at:
   # - Doctor's Dashboard: http://localhost:3000/doctor
   # - Patient Form: http://localhost:3000/patient
   # - Pharmacist Queue: http://localhost:3000/pharmacist
   # - Central Screen: http://localhost:3000/central-screen
   ```

## System Architecture

### Data Flow

1. Doctor creates prescription → DDS publishes to PrescriptionTopic
2. Patient verifies prescription → Updates prescription status
3. Pharmacist processes prescription → Updates status to "processing"
4. Prescription ready → Updates status to "ready"
5. Central screen displays ready prescriptions

### Validation Rules

- Prescription ID: Letter + 6 digits
- Ticket Number: 3-digit random number
- Patient ID: 10-digit numeric string

## Course Information

This project was developed as part of COE 427 Distributed Computing to demonstrate:

- Real-time distributed systems
- Publisher-Subscriber architecture
- Data Distribution Service (DDS) implementation
- Reliable messaging patterns
- Distributed state management

## Implementation Details

Detailed implementation guides and documentation can be found in the `docs` directory:

- DDS Configuration
- Component Architecture
- State Management
- Error Handling
- Testing Procedures

## Future Improvements

- Authentication and authorization
- Persistent storage solution
- Enhanced error handling
- Comprehensive logging
- Load balancing

## License

[Your License]

## Contributors: Team 5 Members

- MOHAMMED ALYOUSIF
- OSAMA ALIBRAHIM
- MOHAMMAD ALSHARIF
- ALI MOHAMED ELMATARWY

Course Instructor: Dr. Ayaz ul Hassan Khan
