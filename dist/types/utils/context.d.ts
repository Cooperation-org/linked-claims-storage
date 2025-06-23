export declare const inlineResumeContext: {
    '@context': {
        '@vocab': string;
        name: string;
        formattedName: string;
        primaryLanguage: string;
        professionalSummary: string;
        text: string;
        contact: string;
        email: string;
        phone: string;
        location: string;
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
        socialLinks: {
            '@id': string;
            '@container': string;
        };
        linkedin: string;
        github: string;
        portfolio: string;
        twitter: string;
        experience: {
            '@id': string;
            '@container': string;
        };
        employmentHistory: {
            '@id': string;
            '@container': string;
        };
        company: string;
        position: string;
        description: string;
        startDate: string;
        endDate: string;
        stillEmployed: string;
        duration: string;
        skills: {
            '@id': string;
            '@container': string;
        };
        educationAndLearning: {
            '@id': string;
            '@container': string;
        };
        degree: string;
        fieldOfStudy: string;
        institution: string;
        year: string;
        awards: {
            '@id': string;
            '@container': string;
        };
        title: string;
        issuer: string;
        date: string;
        publications: {
            '@id': string;
            '@container': string;
        };
        publisher: string;
        url: string;
        certifications: {
            '@id': string;
            '@container': string;
        };
        professionalAffiliations: {
            '@id': string;
            '@container': string;
        };
        organization: string;
        role: string;
        activeAffiliation: string;
        volunteerWork: {
            '@id': string;
            '@container': string;
        };
        currentlyVolunteering: string;
        hobbiesAndInterests: {
            '@id': string;
            '@container': string;
        };
        languages: {
            '@id': string;
            '@container': string;
        };
        language: string;
        proficiency: string;
        testimonials: {
            '@id': string;
            '@container': string;
        };
        author: string;
        projects: {
            '@id': string;
            '@container': string;
        };
        issuanceDate: string;
        credentialSubject: string;
        person: string;
        Resume: string;
    };
};
export declare const employmentCredentialContext: {
    '@context': {
        '@vocab': string;
        fullName: string;
        persons: string;
        credentialName: string;
        credentialDuration: string;
        credentialDescription: string;
        portfolio: {
            '@id': string;
            '@container': string;
        };
        name: string;
        url: string;
        evidenceLink: string;
        evidenceDescription: string;
        company: string;
        role: string;
    };
};
export declare const volunteeringCredentialContext: {
    '@context': {
        '@vocab': string;
        fullName: string;
        persons: string;
        volunteerWork: string;
        volunteerOrg: string;
        volunteerDescription: string;
        skillsGained: {
            '@id': string;
            '@container': string;
        };
        duration: string;
        volunteerDates: string;
        portfolio: {
            '@id': string;
            '@container': string;
        };
        name: string;
        url: string;
        evidenceLink: string;
        evidenceDescription: string;
    };
};
export declare const performanceReviewCredentialContext: {
    '@context': {
        '@vocab': string;
        fullName: string;
        persons: string;
        employeeName: string;
        employeeJobTitle: string;
        company: string;
        role: string;
        reviewStartDate: string;
        reviewEndDate: string;
        reviewDuration: string;
        jobKnowledgeRating: string;
        teamworkRating: string;
        initiativeRating: string;
        communicationRating: string;
        overallRating: string;
        reviewComments: string;
        goalsNext: string;
        portfolio: {
            '@id': string;
            '@container': string;
        };
        name: string;
        url: string;
        evidenceLink: string;
        evidenceDescription: string;
    };
};
declare const localOBContext: {
    '@context': {
        '@protected': boolean;
        id: string;
        type: string;
        OpenBadgeCredential: {
            '@id': string;
        };
        Achievement: {
            '@id': string;
            '@context': {
                '@protected': boolean;
                id: string;
                type: string;
                achievementType: {
                    '@id': string;
                };
                alignment: {
                    '@id': string;
                    '@container': string;
                };
                creator: {
                    '@id': string;
                };
                creditsAvailable: {
                    '@id': string;
                    '@type': string;
                };
                criteria: {
                    '@id': string;
                    '@type': string;
                };
                fieldOfStudy: {
                    '@id': string;
                };
                humanCode: {
                    '@id': string;
                };
                image: {
                    '@id': string;
                    '@type': string;
                };
                otherIdentifier: {
                    '@id': string;
                    '@container': string;
                };
                related: {
                    '@id': string;
                    '@container': string;
                };
                resultDescription: {
                    '@id': string;
                    '@container': string;
                };
                specialization: {
                    '@id': string;
                };
                tag: {
                    '@id': string;
                    '@container': string;
                };
                version: {
                    '@id': string;
                };
                inLanguage: {
                    '@id': string;
                };
            };
        };
        AchievementCredential: {
            '@id': string;
        };
        AchievementSubject: {
            '@id': string;
            '@context': {
                '@protected': boolean;
                id: string;
                type: string;
                achievement: {
                    '@id': string;
                };
                activityEndDate: {
                    '@id': string;
                    '@type': string;
                };
                activityStartDate: {
                    '@id': string;
                    '@type': string;
                };
                creditsEarned: {
                    '@id': string;
                    '@type': string;
                };
                identifier: {
                    '@id': string;
                    '@container': string;
                };
                image: {
                    '@id': string;
                    '@type': string;
                };
                licenseNumber: {
                    '@id': string;
                };
                result: {
                    '@id': string;
                    '@container': string;
                };
                role: {
                    '@id': string;
                };
                source: {
                    '@id': string;
                    '@type': string;
                };
                term: {
                    '@id': string;
                };
            };
        };
        Address: {
            '@id': string;
            '@context': {
                '@protected': boolean;
                id: string;
                type: string;
                addressCountry: {
                    '@id': string;
                };
                addressCountryCode: {
                    '@id': string;
                };
                addressLocality: {
                    '@id': string;
                };
                addressRegion: {
                    '@id': string;
                };
                geo: {
                    '@id': string;
                };
                postOfficeBoxNumber: {
                    '@id': string;
                };
                postalCode: {
                    '@id': string;
                };
                streetAddress: {
                    '@id': string;
                };
            };
        };
        Alignment: {
            '@id': string;
            '@context': {
                '@protected': boolean;
                id: string;
                type: string;
                targetCode: {
                    '@id': string;
                };
                targetDescription: {
                    '@id': string;
                };
                targetFramework: {
                    '@id': string;
                };
                targetName: {
                    '@id': string;
                };
                targetType: {
                    '@id': string;
                };
                targetUrl: {
                    '@id': string;
                    '@type': string;
                };
            };
        };
        Criteria: {
            '@id': string;
        };
        EndorsementCredential: {
            '@id': string;
        };
        EndorsementSubject: {
            '@id': string;
            '@context': {
                '@protected': boolean;
                id: string;
                type: string;
                endorsementComment: {
                    '@id': string;
                };
            };
        };
        Evidence: {
            '@id': string;
            '@context': {
                '@protected': boolean;
                id: string;
                type: string;
                audience: {
                    '@id': string;
                };
                genre: {
                    '@id': string;
                };
            };
        };
        GeoCoordinates: {
            '@id': string;
            '@context': {
                '@protected': boolean;
                id: string;
                type: string;
                latitude: {
                    '@id': string;
                };
                longitude: {
                    '@id': string;
                };
            };
        };
        IdentifierEntry: {
            '@id': string;
            '@context': {
                '@protected': boolean;
                id: string;
                type: string;
                identifier: {
                    '@id': string;
                };
                identifierType: {
                    '@id': string;
                };
            };
        };
        IdentityObject: {
            '@id': string;
            '@context': {
                '@protected': boolean;
                id: string;
                type: string;
                hashed: {
                    '@id': string;
                    '@type': string;
                };
                identityHash: {
                    '@id': string;
                };
                identityType: {
                    '@id': string;
                };
                salt: {
                    '@id': string;
                };
            };
        };
        Image: {
            '@id': string;
            '@context': {
                '@protected': boolean;
                id: string;
                type: string;
                caption: {
                    '@id': string;
                };
            };
        };
        Profile: {
            '@id': string;
            '@context': {
                '@protected': boolean;
                id: string;
                type: string;
                additionalName: {
                    '@id': string;
                };
                address: {
                    '@id': string;
                    '@type': string;
                };
                dateOfBirth: {
                    '@id': string;
                    '@type': string;
                };
                email: {
                    '@id': string;
                };
                familyName: {
                    '@id': string;
                };
                familyNamePrefix: {
                    '@id': string;
                };
                givenName: {
                    '@id': string;
                };
                honorificPrefix: {
                    '@id': string;
                };
                honorificSuffix: {
                    '@id': string;
                };
                image: {
                    '@id': string;
                    '@type': string;
                };
                otherIdentifier: {
                    '@id': string;
                    '@container': string;
                };
                parentOrg: {
                    '@id': string;
                    '@type': string;
                };
                patronymicName: {
                    '@id': string;
                };
                phone: {
                    '@id': string;
                };
                official: {
                    '@id': string;
                };
            };
        };
        Related: {
            '@id': string;
            '@context': {
                '@protected': boolean;
                id: string;
                type: string;
                version: {
                    '@id': string;
                };
                inLanguage: {
                    '@id': string;
                };
            };
        };
        Result: {
            '@id': string;
            '@context': {
                '@protected': boolean;
                id: string;
                type: string;
                achievedLevel: {
                    '@id': string;
                    '@type': string;
                };
                resultDescription: {
                    '@id': string;
                    '@type': string;
                };
                status: {
                    '@id': string;
                };
                value: {
                    '@id': string;
                };
            };
        };
        ResultDescription: {
            '@id': string;
            '@context': {
                '@protected': boolean;
                id: string;
                type: string;
                allowedValue: {
                    '@id': string;
                    '@container': string;
                };
                requiredLevel: {
                    '@id': string;
                    '@type': string;
                };
                requiredValue: {
                    '@id': string;
                };
                resultType: {
                    '@id': string;
                };
                rubricCriterionLevel: {
                    '@id': string;
                    '@container': string;
                };
                valueMax: {
                    '@id': string;
                };
                valueMin: {
                    '@id': string;
                };
            };
        };
        RubricCriterionLevel: {
            '@id': string;
            '@context': {
                '@protected': boolean;
                id: string;
                type: string;
                level: {
                    '@id': string;
                };
                points: {
                    '@id': string;
                };
            };
        };
        alignment: {
            '@id': string;
            '@container': string;
        };
        description: {
            '@id': string;
        };
        endorsement: {
            '@id': string;
            '@container': string;
        };
        image: {
            '@id': string;
            '@type': string;
        };
        inLanguage: {
            '@id': string;
        };
        name: {
            '@id': string;
        };
        narrative: {
            '@id': string;
        };
        url: {
            '@id': string;
            '@type': string;
        };
        awardedDate: {
            '@id': string;
            '@type': string;
        };
    };
};
declare const localED25519Context: {
    '@context': {
        id: string;
        type: string;
        '@protected': boolean;
        proof: {
            '@id': string;
            '@type': string;
            '@container': string;
        };
        Ed25519VerificationKey2020: {
            '@id': string;
            '@context': {
                '@protected': boolean;
                id: string;
                type: string;
                controller: {
                    '@id': string;
                    '@type': string;
                };
                revoked: {
                    '@id': string;
                    '@type': string;
                };
                publicKeyMultibase: {
                    '@id': string;
                    '@type': string;
                };
            };
        };
        Ed25519Signature2020: {
            '@id': string;
            '@context': {
                '@protected': boolean;
                id: string;
                type: string;
                challenge: string;
                created: {
                    '@id': string;
                    '@type': string;
                };
                domain: string;
                expires: {
                    '@id': string;
                    '@type': string;
                };
                nonce: string;
                proofPurpose: {
                    '@id': string;
                    '@type': string;
                    '@context': {
                        '@protected': boolean;
                        id: string;
                        type: string;
                        assertionMethod: {
                            '@id': string;
                            '@type': string;
                            '@container': string;
                        };
                        authentication: {
                            '@id': string;
                            '@type': string;
                            '@container': string;
                        };
                        capabilityInvocation: {
                            '@id': string;
                            '@type': string;
                            '@container': string;
                        };
                        capabilityDelegation: {
                            '@id': string;
                            '@type': string;
                            '@container': string;
                        };
                        keyAgreement: {
                            '@id': string;
                            '@type': string;
                            '@container': string;
                        };
                    };
                };
                proofValue: {
                    '@id': string;
                    '@type': string;
                };
                verificationMethod: {
                    '@id': string;
                    '@type': string;
                };
            };
        };
    };
};
export { localOBContext, localED25519Context };
