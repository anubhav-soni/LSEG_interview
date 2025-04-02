# LSEG_interview

# AWS Instance Metadata Retriever

This Node.js script retrieves metadata from an AWS EC2 instance using the AWS Instance Metadata Service (IMDS). 
It can fetch all metadata in JSON format or retrieve specific metadata keys.

## Repository

This project is hosted on GitHub: [LSEG_interview](https://github.com/anubhav-soni/LSEG_interview)

## Features

- Fetch all instance metadata as JSON.
- Retrieve specific metadata keys.
- Provides mock data when not running in an AWS environment.
- Supports pretty-printing of JSON output.

## Prerequisites

- Node.js installed on your machine.
- The script must be executed from an AWS EC2 instance for real metadata.

## Installation

Clone the repository:

```sh
git clone https://github.com/anubhav-soni/LSEG_interview.git
cd LSEG_interview
```

Install dependencies:

```sh
npm install
```

## Usage

### Get all metadata:
```sh
node metadata.js
```

### Get a specific metadata key:
```sh
node metadata.js local-ipv4
node metadata.js placement/availability-zone
```

### Pretty-print JSON output:
```sh
node metadata.js --pretty
```

## How It Works

1. The script queries the AWS Instance Metadata Service (`http://169.254.169.254/latest/meta-data/`).
2. If a specific key is provided, it fetches only that key.
3. If no key is provided, it retrieves all metadata recursively.
4. If the script is run locally (not in AWS), it returns mock data.
5. The script handles request timeouts and errors.

## Example Output

```json
{
  "instance-id": "i-0123456789abcdef0",
  "instance-type": "t2.micro",
  "placement": {
    "availability-zone": "us-east-1a",
    "region": "us-east-1"
  },
  "public-ipv4": "54.234.56.78"
}
```


