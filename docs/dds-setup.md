# DDS Setup Guide

## Prerequisites
- RTI Connext DDS Professional (6.0.0 or later)
- Node.js 18+
- Windows/Linux/macOS

## Installation Steps

### 1. RTI Connext DDS Installation
1. Download RTI Connext DDS Professional from [RTI's website](https://www.rti.com/free-trial/connect-dds-professional)
2. Follow the installation wizard for your operating system
3. Set up environment variables:
   ```bash
   # Windows
   set NDDSHOME=C:\Program Files\rti_connext_dds-6.0.0
   set PATH=%PATH%;%NDDSHOME%\bin;%NDDSHOME%\lib\x64Win64VS2013

   # Linux/macOS
   export NDDSHOME=/opt/rti_connext_dds-6.0.0
   export PATH=$PATH:$NDDSHOME/bin:$NDDSHOME/lib/x64Linux3gcc5.4.0
   ```

### 2. Project Configuration

#### DDS XML Configuration
The `DDS.xml` file in the project root defines our DDS domains and topics:

```xml
<?xml version="1.0"?>
<dds>
    <types>
        <struct name="Medicine">
            <member name="name" type="string"/>
            <member name="quantity" type="string"/>
            <member name="dosage" type="string"/>
        </struct>
        <struct name="Prescription">
            <member name="prescriptionId" type="string"/>
            <member name="patientId" type="string"/>
            <member name="medicines" type="sequence" subtype="Medicine"/>
            <member name="status" type="string"/>
            <member name="ticketNumber" type="long"/>
            <member name="timestamp" type="string"/>
        </struct>
    </types>
    
    <domain_library name="PrescriptionDomainLib">
        <domain name="PrescriptionDomain" domain_id="0">
            <register_type name="Medicine" type_ref="Medicine"/>
            <register_type name="Prescription" type_ref="Prescription"/>
            <topic name="PrescriptionTopic" register_type_ref="Prescription"/>
        </domain>
    </domain_library>

    <domain_participant_library name="PrescriptionParticipantLib">
        <domain_participant name="PrescriptionPublisher" domain_ref="PrescriptionDomain">
            <publisher name="PrescriptionPublisher">
                <data_writer name="PrescriptionWriter" topic_ref="PrescriptionTopic"/>
            </publisher>
        </domain_participant>
        <domain_participant name="PrescriptionSubscriber" domain_ref="PrescriptionDomain">
            <subscriber name="PrescriptionSubscriber">
                <data_reader name="PrescriptionReader" topic_ref="PrescriptionTopic"/>
            </subscriber>
        </domain_participant>
    </domain_participant_library>
</dds>
```

#### DDS Connector Implementation
The `lib/dds-connector.ts` file implements our DDS connector:

```typescript
import Connector from 'rticonnextdds-connector';
import path from 'path';

export interface Medicine {
  name: string;
  quantity: string;
  dosage: string;
}

export interface Prescription {
  prescriptionId: string;
  patientId: string;
  medicines: Medicine[];
  status: string;
  ticketNumber: number | null;
  timestamp: string;
}

export class DDSConnector {
  private static instance: DDSConnector;
  private connector: any;
  private writer: any;
  private reader: any;

  private constructor() {
    const xmlPath = path.join(process.cwd(), 'DDS.xml');
    this.connector = new Connector('PrescriptionSystem::PrescriptionPublisher', xmlPath);
    this.writer = this.connector.getOutput('PrescriptionWriter');
    this.reader = this.connector.getInput('PrescriptionReader');
  }

  public static getInstance(): DDSConnector {
    if (!DDSConnector.instance) {
      DDSConnector.instance = new DDSConnector();
    }
    return DDSConnector.instance;
  }

  // ... rest of implementation
}
```

## Quality of Service (QoS) Settings

Our DDS implementation uses the following QoS settings:

1. **Reliability**
   - RELIABLE_RELIABILITY_QOS for prescriptions
   - Ensures all data samples are delivered

2. **Durability**
   - TRANSIENT_LOCAL_DURABILITY_QOS
   - Maintains history for late-joining subscribers

3. **History**
   - KEEP_LAST_HISTORY_QOS
   - Stores most recent prescription updates

## Testing DDS Setup

1. **Verify Installation**
   ```bash
   # Check DDS installation
   rtiddsgen -version
   ```

2. **Test DDS Communication**
   ```bash
   # Terminal 1: Start the application
   npm run dev

   # Terminal 2: Monitor DDS traffic (requires RTI tools)
   rtiddsspy -domainId 0
   ```

3. **Verify Data Flow**
   - Create a prescription in the doctor's dashboard
   - Check rtiddsspy output for published data
   - Verify subscription in patient form and queue

## Troubleshooting

### Common Issues

1. **DDS Connection Failures**
   - Verify NDDSHOME environment variable
   - Check network firewall settings
   - Ensure correct domain ID

2. **Data Not Received**
   - Verify QoS compatibility
   - Check topic names match
   - Ensure data types match

3. **Performance Issues**
   - Adjust QoS settings
   - Check network bandwidth
   - Monitor system resources

## Best Practices

1. **Resource Management**
   - Properly dispose of DDS entities
   - Use singleton pattern for connector
   - Implement proper cleanup on component unmount

2. **Error Handling**
   - Implement robust error handling
   - Log DDS-related errors
   - Provide user feedback

3. **Security**
   - Use secure transport when possible
   - Implement access control
   - Monitor DDS traffic

## Additional Resources

- [RTI Connext DDS Documentation](https://community.rti.com/documentation)
- [DDS Security Guide](https://www.omg.org/spec/DDS-SECURITY/)
- [RTI Community Portal](https://community.rti.com/)
