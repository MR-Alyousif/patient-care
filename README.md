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

### Project Structure

```
/lib/
  /services/
    external-api.ts    # External API client for authentication, prescriptions, etc.
    dds-service.ts     # DDS communication service
  /types/
    api-types.ts       # API interfaces and types
    dds-types.ts       # DDS data types
/pages/
  /api/
    dds.ts            # WebSocket/DDS integration
/components/
  /forms/             # Patient, prescription, and login forms
  /ui/                # Reusable UI components
  queue.tsx           # Queue management component
```

### API Integration

The system integrates with an external API (`https://patient-care-api.vercel.app/api`) for:
- Authentication
- Prescription management
- Queue operations
- System metrics

All API operations are centralized in `lib/services/external-api.ts` for better maintainability.

### DDS Implementation

The DDS implementation (`lib/services/dds-service.ts`) follows these principles:
- Singleton pattern for consistent DDS connection
- Real-time data distribution using RTI Connext DDS
- WebSocket integration for browser compatibility
- Transient local durability for reliable messaging

## Network Configuration

### Prerequisites
- All machines must be on the same local network subnet
- UDP multicast must be enabled and properly configured
- Firewall rules must allow UDP multicast traffic

### Verifying Network Configuration

1. **Check Network Configuration**
   ```bash
   # Run the network configuration check
   node scripts/check-network.js
   ```
   Ensure all machines are on the same subnet (e.g., 192.168.3.x/24).

2. **Test Multicast Communication**
   ```bash
   # Run the multicast test
   node scripts/test-multicast.js
   ```
   Each machine should see messages from all other machines in the network.

3. **Configure Windows Firewall** (if needed)
   ```powershell
   # Run as Administrator
   New-NetFirewallRule -DisplayName "Allow UDP Multicast" -Direction Inbound -Protocol UDP -LocalPort 54321 -Action Allow
   New-NetFirewallRule -DisplayName "Allow UDP Multicast" -Direction Outbound -Protocol UDP -LocalPort 54321 -Action Allow
   ```

4. **Configure RTI DDS Environment**
   ```cmd
   # Set DDS discovery peers
   set NDDS_DISCOVERY_PEERS=239.255.0.1
   ```

   Ensure the `USER_RTI_ROUTING_SERVICE.xml` configuration file is present in your project root.

### Troubleshooting Network Issues

1. **Verify Network Route**
   ```cmd
   route print
   ```
   Look for a route that includes your network interface's IP address.

2. **Test Multicast Connectivity**
   ```cmd
   ping -n 4 239.255.0.1
   ```

3. **Check Firewall**
   - Ensure UDP ports 7400-7500 are open for DDS discovery
   - Verify multicast traffic is allowed on your network

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

## Running the Application

1. **Start the Development Server**
   ```bash
   npm run dev
   ```

2. **Access Different Components**
   - Doctor's Dashboard: `http://[machine-ip]:3000/doctor`
   - Patient Form: `http://[machine-ip]:3000/patient`
   - Pharmacist Queue: `http://[machine-ip]:3000/pharmacist`
   - Central Screen: `http://[machine-ip]:3000/central-screen`

   Replace `[machine-ip]` with the actual IP address of each machine.

3. **Verify DDS Communication**
   - Monitor the console for DDS discovery messages
   - Test prescription creation and updates across machines
   - Verify real-time updates on the central screen

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
