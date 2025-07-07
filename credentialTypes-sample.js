const employment = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    {
      '@vocab': 'https://schema.hropenstandards.org/4.4/',
      fullName: 'https://schema.org/name',
      persons: 'https://schema.org/name',
      credentialName: 'https://schema.org/jobTitle',
      credentialDuration: 'https://schema.org/duration',
      credentialDescription: 'https://schema.org/description',
      portfolio: [Object],
      name: 'https://schema.org/name',
      url: 'https://schema.org/url',
      evidenceLink: 'https://schema.org/url',
      evidenceDescription: 'https://schema.org/description',
      company: 'https://schema.org/worksFor',
      role: 'https://schema.org/jobTitle'
    },
    'https://w3id.org/security/suites/ed25519-2020/v1'
  ],
  id: 'urn:10ebeaacfdea4c637a4e794eaf7e17762be3921916ccccafe8338d9461264605',
  type: [ 'VerifiableCredential', 'EmploymentCredential' ],
  issuer: {
    id: 'did:key:z6Mknb5TqMrVxzd4B5of9kLBDZo94bTR2NJSboTTHzynjQqQ',
    type: [ 'Profile' ]
  },
  issuanceDate: '2025-06-23T15:58:08.376Z',
  credentialSubject: {
    type: [ 'WorkExperience' ],
    fullName: 'John Doe',
    persons: 'John Doe',
    credentialName: 'Software Engineer',
    credentialDuration: '2 years',
    credentialDescription: 'Worked as a software engineer at Example Corp.',
    portfolio: [ [Object] ],
    evidenceLink: 'https://evidence.com',
    evidenceDescription: 'Employment contract',
    company: 'Example Corp',
    role: 'Software Engineer'
  },
  proof: {
    type: 'Ed25519Signature2020',
    created: '2025-06-23T15:58:08Z',
    verificationMethod: 'did:key:z6Mknb5TqMrVxzd4B5of9kLBDZo94bTR2NJSboTTHzynjQqQ#z6Mknb5TqMrVxzd4B5of9kLBDZo94bTR2NJSboTTHzynjQqQ',
    proofPurpose: 'assertionMethod',
    proofValue: 'z2g4oz9p13o7vWvgagk1hGYKQcsPNWYQCmxVaUHofd7opLQzv11GNd28TSnbjDBJq7kMSDvUbNWk4nZLRmTMq1q6j'
  }
}

const volunteering = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    {
      '@vocab': 'https://schema.hropenstandards.org/4.4/',
      fullName: 'https://schema.org/name',
      persons: 'https://schema.org/name',
      volunteerWork: 'https://schema.org/roleName',
      volunteerOrg: 'https://schema.org/organization',
      volunteerDescription: 'https://schema.org/description',
      skillsGained: [Object],
      duration: 'https://schema.org/duration',
      volunteerDates: 'https://schema.org/temporalCoverage',
      portfolio: [Object],
      name: 'https://schema.org/name',
      url: 'https://schema.org/url',
      evidenceLink: 'https://schema.org/url',
      evidenceDescription: 'https://schema.org/description'
    },
    'https://w3id.org/security/suites/ed25519-2020/v1'
  ],
  id: 'urn:af087c59bb5888b2722e61813b08cfbbf6015a85fec22d216d9665ecad59f2df',
  type: [ 'VerifiableCredential', 'VolunteeringCredential' ],
  issuer: {
    id: 'did:key:z6Mknb5TqMrVxzd4B5of9kLBDZo94bTR2NJSboTTHzynjQqQ',
    type: [ 'Profile' ]
  },
  issuanceDate: '2025-06-23T15:58:08.389Z',
  credentialSubject: {
    type: [ 'VolunteerRole' ],
    fullName: 'Jane Doe',
    persons: 'Jane Doe',
    volunteerWork: 'Community Helper',
    volunteerOrg: 'Helping Hands',
    volunteerDescription: 'Assisted in community events.',
    skillsGained: [ 'Teamwork', 'Leadership' ],
    duration: '6 months',
    volunteerDates: '2023-01-01 to 2023-07-01',
    portfolio: [ [Object] ],
    evidenceLink: 'https://evidence.com',
    evidenceDescription: 'Volunteer certificate'
  },
  proof: {
    type: 'Ed25519Signature2020',
    created: '2025-06-23T15:58:08Z',
    verificationMethod: 'did:key:z6Mknb5TqMrVxzd4B5of9kLBDZo94bTR2NJSboTTHzynjQqQ#z6Mknb5TqMrVxzd4B5of9kLBDZo94bTR2NJSboTTHzynjQqQ',
    proofPurpose: 'assertionMethod',
    proofValue: 'z3HxW95y3eqJGSDMhBpHbZHEdDdqXDupzvub9VWZe6FpUGHECkEcry4zCMM3cAaXC4BYU16y7Re16mkU4N4AHLYkN'
  }
}

const performanceReview = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    {
      '@vocab': 'https://schema.hropenstandards.org/4.4/',
      fullName: 'https://schema.org/name',
      persons: 'https://schema.org/name',
      employeeName: 'https://schema.org/name',
      employeeJobTitle: 'https://schema.org/jobTitle',
      company: 'https://schema.org/worksFor',
      role: 'https://schema.org/jobTitle',
      reviewStartDate: 'https://schema.org/startDate',
      reviewEndDate: 'https://schema.org/endDate',
      reviewDuration: 'https://schema.org/duration',
      jobKnowledgeRating: 'https://schema.org/assessmentScore',
      teamworkRating: 'https://schema.org/assessmentScore',
      initiativeRating: 'https://schema.org/assessmentScore',
      communicationRating: 'https://schema.org/assessmentScore',
      overallRating: 'https://schema.org/aggregateRating',
      reviewComments: 'https://schema.org/comment',
      goalsNext: 'https://schema.hropenstandards.org/4.4/goalsNext',
      portfolio: [Object],
      name: 'https://schema.org/name',
      url: 'https://schema.org/url',
      evidenceLink: 'https://schema.org/url',
      evidenceDescription: 'https://schema.org/description'
    },
    'https://w3id.org/security/suites/ed25519-2020/v1'
  ],
  id: 'urn:1ddc6176a862717800b1eb80ac422d4c52e4074541ce903b3107587449d4f037',
  type: [ 'VerifiableCredential', 'PerformanceReviewCredential' ],
  issuer: {
    id: 'did:key:z6Mknb5TqMrVxzd4B5of9kLBDZo94bTR2NJSboTTHzynjQqQ',
    type: [ 'Profile' ]
  },
  issuanceDate: '2025-06-23T15:58:08.392Z',
  credentialSubject: {
    type: [ 'EndorsementSubject' ],
    fullName: 'Alex Smith',
    persons: 'Alex Smith',
    employeeName: 'Alex Smith',
    employeeJobTitle: 'Developer',
    company: 'Tech Co',
    role: 'Reviewer',
    reviewStartDate: '2023-01-01',
    reviewEndDate: '2023-12-31',
    reviewDuration: '1 year',
    jobKnowledgeRating: '5',
    teamworkRating: '4',
    initiativeRating: '5',
    communicationRating: '4',
    overallRating: '5',
    reviewComments: 'Excellent performance.',
    goalsNext: 'Improve code quality, Mentor juniors',
    portfolio: [ [Object] ],
    evidenceLink: 'https://evidence.com',
    evidenceDescription: 'Performance review document'
  },
  proof: {
    type: 'Ed25519Signature2020',
    created: '2025-06-23T15:58:08Z',
    verificationMethod: 'did:key:z6Mknb5TqMrVxzd4B5of9kLBDZo94bTR2NJSboTTHzynjQqQ#z6Mknb5TqMrVxzd4B5of9kLBDZo94bTR2NJSboTTHzynjQqQ',
    proofPurpose: 'assertionMethod',
    proofValue: 'z43x4onJZXiNSkVDxTpHzvtCE3Pv4FG9MMMFaxhBSGSkZie9bzeR8bXcjFL5DTVpLxcrzPtnGpsqoJpTQRnFfxwVZ'
  }
}