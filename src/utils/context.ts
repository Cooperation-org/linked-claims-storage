export const inlineResumeContext = {
	'@context': {
		'@vocab': 'https://schema.hropenstandards.org/4.4/',

		// Basic details
		name: 'https://schema.org/name',
		formattedName: 'https://schema.org/formattedName',
		primaryLanguage: 'https://schema.org/primaryLanguage',

		// Narrative
		professionalSummary: 'https://schema.org/professionalSummary',
		text: 'https://schema.org/text',

		// Contact Information
		contact: 'https://schema.org/ContactPoint',
		email: 'https://schema.org/email',
		phone: 'https://schema.org/telephone',
		location: 'https://schema.org/address',
		street: 'https://schema.org/streetAddress',
		city: 'https://schema.org/addressLocality',
		state: 'https://schema.org/addressRegion',
		country: 'https://schema.org/addressCountry',
		postalCode: 'https://schema.org/postalCode',
		socialLinks: {
			'@id': 'https://schema.org/URL',
			'@container': '@set',
		},
		linkedin: 'https://schema.org/sameAs',
		github: 'https://schema.org/sameAs',
		portfolio: 'https://schema.org/url',
		twitter: 'https://schema.org/sameAs',

		// Experience & Employment History
		experience: {
			'@id': 'https://schema.org/WorkExperience',
			'@container': '@list',
		},
		employmentHistory: {
			'@id': 'https://schema.org/employmentHistory',
			'@container': '@list',
		},
		company: 'https://schema.org/worksFor',
		position: 'https://schema.org/jobTitle',
		description: 'https://schema.org/description',
		startDate: 'https://schema.org/startDate',
		endDate: 'https://schema.org/endDate',
		stillEmployed: 'https://schema.org/Boolean',
		duration: 'https://schema.org/temporalCoverage',

		// Skills
		skills: {
			'@id': 'https://schema.org/skills',
			'@container': '@list',
		},

		// Education
		educationAndLearning: {
			'@id': 'https://schema.org/EducationalOccupationalProgram',
			'@container': '@list',
		},
		degree: 'https://schema.org/educationalCredentialAwarded',
		fieldOfStudy: 'https://schema.org/studyField',
		institution: 'https://schema.org/educationalInstitution',
		year: 'https://schema.org/year',

		// Awards
		awards: {
			'@id': 'https://schema.org/Achievement',
			'@container': '@list',
		},
		title: 'https://schema.org/name',
		issuer: 'https://schema.org/issuer',
		date: 'https://schema.org/dateReceived',

		// Publications
		publications: {
			'@id': 'https://schema.org/CreativeWork',
			'@container': '@list',
		},
		publisher: 'https://schema.org/publisher',
		url: 'https://schema.org/url',

		// Certifications
		certifications: {
			'@id': 'https://schema.org/EducationalOccupationalCredential',
			'@container': '@list',
		},

		// Professional Affiliations
		professionalAffiliations: {
			'@id': 'https://schema.org/OrganizationRole',
			'@container': '@list',
		},
		organization: 'https://schema.org/memberOf',
		role: 'https://schema.org/jobTitle',
		activeAffiliation: 'https://schema.org/Boolean',

		// Volunteer Work
		volunteerWork: {
			'@id': 'https://schema.org/VolunteerRole',
			'@container': '@list',
		},
		currentlyVolunteering: 'https://schema.org/Boolean',

		// Hobbies and Interests
		hobbiesAndInterests: {
			'@id': 'https://schema.org/knowsAbout',
			'@container': '@set',
		},

		// Languages
		languages: {
			'@id': 'https://schema.org/knowsLanguage',
			'@container': '@list',
		},
		language: 'https://schema.org/inLanguage',
		proficiency: 'https://schema.org/proficiencyLevel',

		// Testimonials
		testimonials: {
			'@id': 'https://schema.org/Review',
			'@container': '@list',
		},
		author: 'https://schema.org/author',

		// Projects
		projects: {
			'@id': 'https://schema.org/Project',
			'@container': '@list',
		},

		// Issuance Information
		issuanceDate: 'https://schema.org/issuanceDate',
		credentialSubject: 'https://schema.org/credentialSubject',
		person: 'https://schema.org/Person',
		Resume: 'https://schema.hropenstandards.org/4.4#Resume',
	},
};

// 1. Employment Credential Context
export const employmentCredentialContext = {
  '@context': {
    '@vocab': 'https://schema.hropenstandards.org/4.4/',
    fullName:               'https://schema.org/name',
    persons:                'https://schema.org/name',
    credentialName:         'https://schema.org/jobTitle',
    credentialDuration:     'https://schema.org/duration',
    credentialDescription:  'https://schema.org/description',
    portfolio: {
      '@id':        'https://schema.org/hasPart',
      '@container': '@list'
    },
    name:                   'https://schema.org/name',
    url:                    'https://schema.org/url',
    evidenceLink:           'https://schema.org/url',
    evidenceDescription:    'https://schema.org/description',
    company:                'https://schema.org/worksFor',
    role:                   'https://schema.org/jobTitle'
  }
};

// 2. Volunteering Credential Context
export const volunteeringCredentialContext = {
  '@context': {
    '@vocab': 'https://schema.hropenstandards.org/4.4/',
    fullName:             'https://schema.org/name',
    persons:              'https://schema.org/name',
    volunteerWork:        'https://schema.org/roleName',
    volunteerOrg:         'https://schema.org/organization',
    volunteerDescription: 'https://schema.org/description',
    skillsGained: {
      '@id':        'https://schema.org/skills',
      '@container': '@list'
    },
    duration:            'https://schema.org/duration',
    volunteerDates:      'https://schema.org/temporalCoverage',
    portfolio: {
      '@id':        'https://schema.org/hasPart',
      '@container': '@list'
    },
    name:                   'https://schema.org/name',
    url:                    'https://schema.org/url',
    evidenceLink:           'https://schema.org/url',
    evidenceDescription:    'https://schema.org/description'
  }
};

// 3. Performance Review Credential Context
export const performanceReviewCredentialContext = {
  '@context': {
    '@vocab': 'https://schema.hropenstandards.org/4.4/',
    fullName:            'https://schema.org/name',
    persons:             'https://schema.org/name',
    employeeName:        'https://schema.org/name',
    employeeJobTitle:    'https://schema.org/jobTitle',
    company:             'https://schema.org/worksFor',
    role:                'https://schema.org/jobTitle',
    reviewStartDate:     'https://schema.org/startDate',
    reviewEndDate:       'https://schema.org/endDate',
    reviewDuration:      'https://schema.org/duration',
    jobKnowledgeRating:  'https://schema.org/assessmentScore',
    teamworkRating:      'https://schema.org/assessmentScore',
    initiativeRating:    'https://schema.org/assessmentScore',
    communicationRating: 'https://schema.org/assessmentScore',
    overallRating:       'https://schema.org/aggregateRating',
    reviewComments:      'https://schema.org/comment',
    goalsNext:           'https://schema.hropenstandards.org/4.4/goalsNext',
    portfolio: {
      '@id':        'https://schema.org/hasPart',
      '@container': '@list'
    },
    name:                   'https://schema.org/name',
    url:                    'https://schema.org/url',
    evidenceLink:           'https://schema.org/url',
    evidenceDescription:    'https://schema.org/description'
  }
};


const localOBContext = {
	'@context': {
		'@protected': true,
		id: '@id',
		type: '@type',
		OpenBadgeCredential: {
			'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#OpenBadgeCredential',
		},
		Achievement: {
			'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#Achievement',
			'@context': {
				'@protected': true,
				id: '@id',
				type: '@type',
				achievementType: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#achievementType',
				},
				alignment: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#alignment',
					'@container': '@set',
				},
				creator: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#creator',
				},
				creditsAvailable: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#creditsAvailable',
					'@type': 'https://www.w3.org/2001/XMLSchema#float',
				},
				criteria: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#Criteria',
					'@type': '@id',
				},
				fieldOfStudy: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#fieldOfStudy',
				},
				humanCode: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#humanCode',
				},
				image: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#image',
					'@type': '@id',
				},
				otherIdentifier: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#otherIdentifier',
					'@container': '@set',
				},
				related: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#related',
					'@container': '@set',
				},
				resultDescription: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#resultDescription',
					'@container': '@set',
				},
				specialization: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#specialization',
				},
				tag: {
					'@id': 'https://schema.org/keywords',
					'@container': '@set',
				},
				version: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#version',
				},
				inLanguage: {
					'@id': 'https://schema.org/inLanguage',
				},
			},
		},
		AchievementCredential: {
			'@id': 'OpenBadgeCredential',
		},
		AchievementSubject: {
			'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#AchievementSubject',
			'@context': {
				'@protected': true,
				id: '@id',
				type: '@type',
				achievement: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#achievement',
				},
				activityEndDate: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#activityEndDate',
					'@type': 'https://www.w3.org/2001/XMLSchema#date',
				},
				activityStartDate: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#activityStartDate',
					'@type': 'https://www.w3.org/2001/XMLSchema#date',
				},
				creditsEarned: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#creditsEarned',
					'@type': 'https://www.w3.org/2001/XMLSchema#float',
				},
				identifier: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#identifier',
					'@container': '@set',
				},
				image: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#image',
					'@type': '@id',
				},
				licenseNumber: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#licenseNumber',
				},
				result: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#result',
					'@container': '@set',
				},
				role: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#role',
				},
				source: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#source',
					'@type': '@id',
				},
				term: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#term',
				},
			},
		},
		Address: {
			'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#Address',
			'@context': {
				'@protected': true,
				id: '@id',
				type: '@type',
				addressCountry: {
					'@id': 'https://schema.org/addressCountry',
				},
				addressCountryCode: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#CountryCode',
				},
				addressLocality: {
					'@id': 'https://schema.org/addressLocality',
				},
				addressRegion: {
					'@id': 'https://schema.org/addressRegion',
				},
				geo: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#GeoCoordinates',
				},
				postOfficeBoxNumber: {
					'@id': 'https://schema.org/postOfficeBoxNumber',
				},
				postalCode: {
					'@id': 'https://schema.org/postalCode',
				},
				streetAddress: {
					'@id': 'https://schema.org/streetAddress',
				},
			},
		},
		Alignment: {
			'@id': 'https://schema.org/AlignmentObject',
			'@context': {
				'@protected': true,
				id: '@id',
				type: '@type',
				targetCode: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#targetCode',
				},
				targetDescription: {
					'@id': 'https://schema.org/targetDescription',
				},
				targetFramework: {
					'@id': 'https://schema.org/targetFramework',
				},
				targetName: {
					'@id': 'https://schema.org/targetName',
				},
				targetType: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#targetType',
				},
				targetUrl: {
					'@id': 'https://schema.org/targetUrl',
					'@type': 'https://www.w3.org/2001/XMLSchema#anyURI',
				},
			},
		},
		Criteria: {
			'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#Criteria',
		},
		EndorsementCredential: {
			'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#EndorsementCredential',
		},
		EndorsementSubject: {
			'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#EndorsementSubject',
			'@context': {
				'@protected': true,
				id: '@id',
				type: '@type',
				endorsementComment: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#endorsementComment',
				},
			},
		},
		Evidence: {
			'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#Evidence',
			'@context': {
				'@protected': true,
				id: '@id',
				type: '@type',
				audience: {
					'@id': 'https://schema.org/audience',
				},
				genre: {
					'@id': 'https://schema.org/genre',
				},
			},
		},
		GeoCoordinates: {
			'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#GeoCoordinates',
			'@context': {
				'@protected': true,
				id: '@id',
				type: '@type',
				latitude: {
					'@id': 'https://schema.org/latitude',
				},
				longitude: {
					'@id': 'https://schema.org/longitude',
				},
			},
		},
		IdentifierEntry: {
			'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#IdentifierEntry',
			'@context': {
				'@protected': true,
				id: '@id',
				type: '@type',
				identifier: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#identifier',
				},
				identifierType: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#identifierType',
				},
			},
		},
		IdentityObject: {
			'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#IdentityObject',
			'@context': {
				'@protected': true,
				id: '@id',
				type: '@type',
				hashed: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#hashed',
					'@type': 'https://www.w3.org/2001/XMLSchema#boolean',
				},
				identityHash: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#identityHash',
				},
				identityType: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#identityType',
				},
				salt: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#salt',
				},
			},
		},
		Image: {
			'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#Image',
			'@context': {
				'@protected': true,
				id: '@id',
				type: '@type',
				caption: {
					'@id': 'https://schema.org/caption',
				},
			},
		},
		Profile: {
			'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#Profile',
			'@context': {
				'@protected': true,
				id: '@id',
				type: '@type',
				additionalName: {
					'@id': 'https://schema.org/additionalName',
				},
				address: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#address',
					'@type': '@id',
				},
				dateOfBirth: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#dateOfBirth',
					'@type': 'https://www.w3.org/2001/XMLSchema#date',
				},
				email: {
					'@id': 'https://schema.org/email',
				},
				familyName: {
					'@id': 'https://schema.org/familyName',
				},
				familyNamePrefix: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#familyNamePrefix',
				},
				givenName: {
					'@id': 'https://schema.org/givenName',
				},
				honorificPrefix: {
					'@id': 'https://schema.org/honorificPrefix',
				},
				honorificSuffix: {
					'@id': 'https://schema.org/honorificSuffix',
				},
				image: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#image',
					'@type': '@id',
				},
				otherIdentifier: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#otherIdentifier',
					'@container': '@set',
				},
				parentOrg: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#parentOrg',
					'@type': '@id',
				},
				patronymicName: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#patronymicName',
				},
				phone: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#phone',
				},
				official: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#official',
				},
			},
		},
		Related: {
			'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#Related',
			'@context': {
				'@protected': true,
				id: '@id',
				type: '@type',
				version: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#version',
				},
				inLanguage: {
					'@id': 'https://schema.org/inLanguage',
				},
			},
		},
		Result: {
			'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#Result',
			'@context': {
				'@protected': true,
				id: '@id',
				type: '@type',
				achievedLevel: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#achievedLevel',
					'@type': 'https://www.w3.org/2001/XMLSchema#anyURI',
				},
				resultDescription: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#resultDescription',
					'@type': 'https://www.w3.org/2001/XMLSchema#anyURI',
				},
				status: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#status',
				},
				value: {
					'@id': 'https://schema.org/value',
				},
			},
		},
		ResultDescription: {
			'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#ResultDescription',
			'@context': {
				'@protected': true,
				id: '@id',
				type: '@type',
				allowedValue: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#allowedValue',
					'@container': '@list',
				},
				requiredLevel: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#requiredLevel',
					'@type': 'https://www.w3.org/2001/XMLSchema#anyURI',
				},
				requiredValue: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#requiredValue',
				},
				resultType: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#resultType',
				},
				rubricCriterionLevel: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#rubricCriterionLevel',
					'@container': '@set',
				},
				valueMax: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#valueMax',
				},
				valueMin: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#valueMin',
				},
			},
		},
		RubricCriterionLevel: {
			'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#RubricCriterionLevel',
			'@context': {
				'@protected': true,
				id: '@id',
				type: '@type',
				level: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#level',
				},
				points: {
					'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#points',
				},
			},
		},
		alignment: {
			'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#alignment',
			'@container': '@set',
		},
		description: {
			'@id': 'https://schema.org/description',
		},
		endorsement: {
			'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#endorsement',
			'@container': '@set',
		},
		image: {
			'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#image',
			'@type': '@id',
		},
		inLanguage: {
			'@id': 'https://schema.org/inLanguage',
		},
		name: {
			'@id': 'https://schema.org/name',
		},
		narrative: {
			'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#narrative',
		},
		url: {
			'@id': 'https://schema.org/url',
			'@type': 'https://www.w3.org/2001/XMLSchema#anyURI',
		},
		awardedDate: {
			'@id': 'https://purl.imsglobal.org/spec/vc/ob/vocab.html#awardedDate',
			'@type': 'xsd:dateTime',
		},
	},
};
const localED25519Context = {
	'@context': {
		id: '@id',
		type: '@type',
		'@protected': true,
		proof: {
			'@id': 'https://w3id.org/security#proof',
			'@type': '@id',
			'@container': '@graph',
		},
		Ed25519VerificationKey2020: {
			'@id': 'https://w3id.org/security#Ed25519VerificationKey2020',
			'@context': {
				'@protected': true,
				id: '@id',
				type: '@type',
				controller: {
					'@id': 'https://w3id.org/security#controller',
					'@type': '@id',
				},
				revoked: {
					'@id': 'https://w3id.org/security#revoked',
					'@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
				},
				publicKeyMultibase: {
					'@id': 'https://w3id.org/security#publicKeyMultibase',
					'@type': 'https://w3id.org/security#multibase',
				},
			},
		},
		Ed25519Signature2020: {
			'@id': 'https://w3id.org/security#Ed25519Signature2020',
			'@context': {
				'@protected': true,
				id: '@id',
				type: '@type',
				challenge: 'https://w3id.org/security#challenge',
				created: {
					'@id': 'http://purl.org/dc/terms/created',
					'@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
				},
				domain: 'https://w3id.org/security#domain',
				expires: {
					'@id': 'https://w3id.org/security#expiration',
					'@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
				},
				nonce: 'https://w3id.org/security#nonce',
				proofPurpose: {
					'@id': 'https://w3id.org/security#proofPurpose',
					'@type': '@vocab',
					'@context': {
						'@protected': true,
						id: '@id',
						type: '@type',
						assertionMethod: {
							'@id': 'https://w3id.org/security#assertionMethod',
							'@type': '@id',
							'@container': '@set',
						},
						authentication: {
							'@id': 'https://w3id.org/security#authenticationMethod',
							'@type': '@id',
							'@container': '@set',
						},
						capabilityInvocation: {
							'@id': 'https://w3id.org/security#capabilityInvocationMethod',
							'@type': '@id',
							'@container': '@set',
						},
						capabilityDelegation: {
							'@id': 'https://w3id.org/security#capabilityDelegationMethod',
							'@type': '@id',
							'@container': '@set',
						},
						keyAgreement: {
							'@id': 'https://w3id.org/security#keyAgreementMethod',
							'@type': '@id',
							'@container': '@set',
						},
					},
				},
				proofValue: {
					'@id': 'https://w3id.org/security#proofValue',
					'@type': 'https://w3id.org/security#multibase',
				},
				verificationMethod: {
					'@id': 'https://w3id.org/security#verificationMethod',
					'@type': '@id',
				},
			},
		},
	},
};

export { localOBContext, localED25519Context };
