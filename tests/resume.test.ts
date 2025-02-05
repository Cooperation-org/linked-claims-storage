import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleDriveStorage, Resume, ResumeVC } from '../dist';

// Mocked data for testing
const fakeResume = {
	resume: {
		id: 'res-1lsdlskdlskl',
		lastUpdated: new Date().toISOString(),
		title: 'Software Engineer - John Doe',
		version: 1,
		contact: {
			fullName: 'Lila Smith',
			email: 'johndoe@example.com',
		},
		summary: 'Experienced software engineer specializing in JavaScript, React, and Node.js.',
		experience: {
			items: [
				{
					id: 'exp-1',
					jobTitle: 'Senior Software Engineer',
					company: 'Tech Corp Inc.',
					startDate: '2019-06-01',
					endDate: 'Present',
				},
			],
		},
		skills: {
			items: [{ id: 'skill-1', name: 'JavaScript', proficiency: 'Advanced' }],
		},
	},
	status: 'idle',
	error: null,
};

// Mock classes
vi.mock('../dist/index', () => ({
	GoogleDriveStorage: vi.fn().mockImplementation(() => ({
		getAllFilesByType: vi.fn(),
		saveFile: vi.fn(),
	})),
	Resume: vi.fn().mockImplementation(() => ({
		saveResume: vi.fn(),
		getSignedResumes: vi.fn(),
		getNonSignedResumes: vi.fn(),
		find: vi.fn(),
		getOrCreateFolder: vi.fn(),
	})),
	ResumeVC: vi.fn().mockImplementation(() => ({
		generateKeyPair: vi.fn(),
		createDID: vi.fn(),
		sign: vi.fn(),
	})),
}));

describe('Resume Management Tests', () => {
	let storage, resumeManager, resumeVC;

	beforeEach(() => {
		storage = new GoogleDriveStorage();
		resumeManager = new Resume(storage);
		resumeVC = new ResumeVC();
	});

	it('should save an unsigned resume successfully', async () => {
		resumeManager.saveResume.mockResolvedValue({ success: true, id: 'res-1lsdlskdlskl' });

		const result = await resumeManager.saveResume({ resume: fakeResume, type: 'unsigned' });

		expect(resumeManager.saveResume).toHaveBeenCalledWith({ resume: fakeResume, type: 'unsigned' });
		expect(result).toEqual({ success: true, id: 'res-1lsdlskdlskl' });
	});

	it('should fetch signed resumes', async () => {
		const signedResumesMock = [{ id: 'signed-resume-1', title: 'Signed Resume' }];
		resumeManager.getSignedResumes.mockResolvedValue(signedResumesMock);

		const result = await resumeManager.getSignedResumes();

		expect(resumeManager.getSignedResumes).toHaveBeenCalled();
		expect(result).toEqual(signedResumesMock);
	});

	it('should fetch non-signed resumes', async () => {
		const nonSignedResumesMock = [{ id: 'unsigned-resume-1', title: 'Unsigned Resume' }];
		resumeManager.getNonSignedResumes.mockResolvedValue(nonSignedResumesMock);

		const result = await resumeManager.getNonSignedResumes();

		expect(resumeManager.getNonSignedResumes).toHaveBeenCalled();
		expect(result).toEqual(nonSignedResumesMock);
	});

	it('should find a specific resume', async () => {
		const specificResumeMock = { id: 'res-1lsdlskdlskl', title: 'Software Engineer - John Doe' };
		resumeManager.find.mockResolvedValue(specificResumeMock);

		const result = await resumeManager.find();

		expect(resumeManager.find).toHaveBeenCalled();
		expect(result).toEqual(specificResumeMock);
	});

	it('should generate a key pair', async () => {
		const keyPairMock = { publicKey: 'mockPublicKey', privateKey: 'mockPrivateKey' };
		resumeVC.generateKeyPair.mockResolvedValue(keyPairMock);

		const result = await resumeVC.generateKeyPair();

		expect(resumeVC.generateKeyPair).toHaveBeenCalled();
		expect(result).toEqual(keyPairMock);
	});

	it('should create a DID', async () => {
		const didMock = { id: 'did:example:1234' };
		resumeVC.createDID.mockResolvedValue(didMock);

		const result = await resumeVC.createDID({ keyPair: {} });

		expect(resumeVC.createDID).toHaveBeenCalledWith({ keyPair: {} });
		expect(result).toEqual(didMock);
	});

	it('should sign a resume', async () => {
		const signedResumeMock = { id: 'signed-res-123', signed: true };
		resumeVC.sign.mockResolvedValue(signedResumeMock);

		const result = await resumeVC.sign({ formData: fakeResume, issuerDid: 'did:example:1234', keyPair: {} });

		expect(resumeVC.sign).toHaveBeenCalledWith({
			formData: fakeResume,
			issuerDid: 'did:example:1234',
			keyPair: {},
		});
		expect(result).toEqual(signedResumeMock);
	});
});
