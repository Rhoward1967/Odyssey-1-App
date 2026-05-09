import AcademicSearchModal from '../components/AcademicSearchModal';
import DocumentReviewModal from '../components/DocumentReviewModal';
import FileUploadModal from '../components/FileUploadModal';
import StudyGroupModal from '../components/StudyGroupModal';
import K12HomeworkHelper from '../components/K12HomeworkHelper';
import K12EducationalGames from '../components/K12EducationalGames';
import K12LiveTutoring from '../components/K12LiveTutoring';
import K12StudyAssistant from '../components/K12StudyAssistant';
import LegalScenarioAnalyzer from '../components/LegalScenarioAnalyzer';
import LegalCounterCanon from '../components/LegalCounterCanon';
import LegalLetterGenerator from '../components/LegalLetterGenerator';

// Legacy placeholder imports (retained for reference)

import {
  BookOpen,

  Briefcase,

  FileText,

  GraduationCap,

  Share2,

  Stethoscope,

  Upload,

  Users,

  Video
} from 'lucide-react';

import { useEffect, useRef, useState } from 'react';

import { Badge } from '../components/ui/badge';

import { Button } from '../components/ui/button';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';



// --- MOCK COMPONENT STUBS ---

// These stubs are for local testing and should be replaced by the Lab team with the actual components.






export default function MediaCenter() {

  const [activeTab, setActiveTab] = useState('study');

  // Track which feature is active (e.g., 'none', 'homework', 'games', 'tutor')

  const [activeFeature, setActiveFeature] = useState<'none' | 'homework' | 'games' | 'tutor'>('none');

  const [videoCallActive, setVideoCallActive] = useState(false);

  const [notes, setNotes] = useState('');

  const [userType, setUserType] = useState<'k12' | 'legal' | 'medical' | 'college' | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const [showStudyGroupModal, setShowStudyGroupModal] = useState(false);

  const [showFileUploadModal, setShowFileUploadModal] = useState(false);

  const [showAcademicSearchModal, setShowAcademicSearchModal] = useState(false);

  const [showDocumentReviewModal, setShowDocumentReviewModal] = useState(false);
  const [legalFeature, setLegalFeature] = useState<'none' | 'scenario' | 'countercanon' | 'letters'>('none');

  // Attach stream to video element when stream changes

  useEffect(() => {

    if (stream && videoRef.current) {

      videoRef.current.srcObject = stream;

      // Force play after setting srcObject

      videoRef.current.play().catch(err => {

        console.error('Error playing video:', err);

      });

    }

  }, [stream]);



  // Cleanup stream when component unmounts

  useEffect(() => {

    return () => {

      if (stream) {

        stream.getTracks().forEach(track => track.stop());

      }

    };

  }, [stream]);



  const handleStartVideoCall = async () => {

    if (videoCallActive && stream) {

      // Stop the video

      stream.getTracks().forEach(track => track.stop());

      setStream(null);

      setVideoCallActive(false);

      if (videoRef.current) {

        videoRef.current.srcObject = null;

      }

    } else {

      // Start the video

      try {

        const mediaStream = await navigator.mediaDevices.getUserMedia({

          video: {

            width: { ideal: 1280 },

            height: { ideal: 720 },

            facingMode: 'user'

          },

          audio: true

        });

       

        console.log('ðŸ"¹ Camera stream obtained:', mediaStream.getTracks());

        setStream(mediaStream);

        setVideoCallActive(true);

        // The useEffect will attach the stream to the video element

      } catch (error) {

        console.error('Error accessing camera:', error);

        // Using window.alert for compliance

        window.alert('ðŸŽ¥ Camera Access Error\n\n' +

          'Could not access your camera. Please:\n' +

          'â€¢ Grant camera permissions in your browser\n' +

          'â€¢ Make sure no other app is using the camera\n' +

          'â€¢ Check if your camera is properly connected\n\n' +

          'Error: ' + (error instanceof Error ? error.message : 'Unknown error'));

      }

    }

  };



  const handleJoinStudyGroup = () => {

    if (!userType) {

      window.alert('Please select a user type first (K-12, Legal, Medical, or College)');

      return;

    }

    setShowStudyGroupModal(true);

  };



  const handleUploadFiles = () => {

    setShowFileUploadModal(true);

  };



  const handleShareDocument = () => {
    // Document sharing — coming in next release
  };



  const handleSearchPapers = () => {

    if (!userType) {

      window.alert('Please select a user type first (K-12, Legal, Medical, or College)');

      return;

    }

    setShowAcademicSearchModal(true);

  };



  const handleReviewDocs = () => {

    setShowDocumentReviewModal(true);

  };



  const handleFeatureClick = (feature: string) => {

    // MANDATE: K-12 Homework Helper: launch AIChat view

    if (userType === 'k12' && feature === 'homework') {

      setActiveFeature('homework');

      return;

    }

    // MANDATE: K-12 Games: launch Games view

    if (userType === 'k12' && feature === 'games') {

      setActiveFeature('games');

      return;

    }

     // MANDATE: K-12 Tutoring: launch Tutor view

    if (userType === 'k12' && feature === 'tutor') {

      setActiveFeature('tutor');

      return;

    }



    // Other features: retain placeholder for now

    const messages: Record<string, string> = {
      'pubmed': 'PubMed Search: 35M+ citations, full-text articles, clinical studies and medical journals.',
      'trials': 'Clinical Trials: Active trials, research studies, patient recruitment and trial results.',
      'network': 'Medical Peer Network: Connect with specialists, research collaborators and clinical teams.',
      'studygroups': 'Study Groups: Find study partners, schedule sessions and share resources.',
      'papers': 'Research Papers: Google Scholar, JSTOR, IEEE Xplore and arXiv preprints.',
      'career': 'Career Prep: Resume builder, interview practice, job board and networking tips.',
    };

    window.alert(messages[feature] || 'Feature coming soon!');

  };



  // --- RENDERING HELPERS ---

  const renderK12FeatureCards = () => (

    <>

        <Card className="bg-blue-900/30">

            <CardContent className="p-4">

                <h4 className="text-white font-semibold mb-2">ðŸ" Homework Helper</h4>

                <p className="text-sm text-gray-400 mb-3">Step-by-step problem solving for math, science, and more</p>

                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleFeatureClick('homework')}>Start Session</Button>

            </CardContent>

        </Card>

        <Card className="bg-blue-900/30">

            <CardContent className="p-4">

                <h4 className="text-white font-semibold mb-2">ðŸŽ® Educational Games</h4>

                <p className="text-sm text-gray-400 mb-3">Learn through interactive games and quizzes</p>

                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleFeatureClick('games')}>Play Now</Button>

            </CardContent>

        </Card>

        <Card className="bg-blue-900/30">

            <CardContent className="p-4">

                <h4 className="text-white font-semibold mb-2">ðŸ'¨â€ðŸ« Live Tutoring</h4>

                <p className="text-sm text-gray-400 mb-3">Connect with certified tutors for 1-on-1 help</p>

                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleFeatureClick('tutor')}>Find Tutor</Button>

            </CardContent>

        </Card>

    </>

  );



  const renderK12ActiveFeature = () => {

    switch (activeFeature) {

      case 'homework':
        return <K12HomeworkHelper onBack={() => setActiveFeature('none')} />;

      case 'games':
        return <K12EducationalGames onBack={() => setActiveFeature('none')} />;

      case 'tutor':
        return <K12LiveTutoring onBack={() => setActiveFeature('none')} />;

      case 'none':
      default:

        // This returns the three feature cards, spread across the 3 columns

        return renderK12FeatureCards();

    }

  };





  return (

    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold text-white mb-2">ðŸŽ" Media Center</h1>

        <p className="text-gray-400">Educational hub for students, professionals, and lifelong learners</p>

      </div>



      {/* User Type Selection */}

      <div className="grid md:grid-cols-4 gap-4">

        <Card

          className={`bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30 cursor-pointer transition-all hover:scale-105 hover:border-blue-400 ${

            userType === 'k12' ? 'ring-2 ring-blue-400 scale-105' : ''

          }`}

          onClick={() => setUserType(userType === 'k12' ? null : 'k12')}

        >

          <CardContent className="p-4 text-center">

            <GraduationCap className="w-8 h-8 mx-auto mb-2 text-blue-400" />

            <h3 className="text-white font-semibold">K-12 Students</h3>

            <p className="text-xs text-gray-400">Interactive learning & homework help</p>

            {userType === 'k12' && <Badge className="mt-2 bg-blue-600">Active</Badge>}

          </CardContent>

        </Card>



        <Card

          className={`bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30 cursor-pointer transition-all hover:scale-105 hover:border-green-400 ${

            userType === 'legal' ? 'ring-2 ring-green-400 scale-105' : ''

          }`}

          onClick={() => setUserType(userType === 'legal' ? null : 'legal')}

        >

          <CardContent className="p-4 text-center">

            <Briefcase className="w-8 h-8 mx-auto mb-2 text-green-400" />

            <h3 className="text-white font-semibold">Legal Professionals</h3>

            <p className="text-xs text-gray-400">Case research & document review</p>

            {userType === 'legal' && <Badge className="mt-2 bg-green-600">Active</Badge>}

          </CardContent>

        </Card>



        <Card

          className={`bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30 cursor-pointer transition-all hover:scale-105 hover:border-purple-400 ${

            userType === 'medical' ? 'ring-2 ring-purple-400 scale-105' : ''

          }`}

          onClick={() => setUserType(userType === 'medical' ? null : 'medical')}

        >

          <CardContent className="p-4 text-center">

            <Stethoscope className="w-8 h-8 mx-auto mb-2 text-purple-400" />

            <h3 className="text-white font-semibold">Medical Professionals</h3>

            <p className="text-xs text-gray-400">Research & collaboration</p>

            {userType === 'medical' && <Badge className="mt-2 bg-purple-600">Active</Badge>}

          </CardContent>

        </Card>



        <Card

          className={`bg-gradient-to-br from-orange-600/20 to-orange-800/20 border-orange-500/30 cursor-pointer transition-all hover:scale-105 hover:border-orange-400 ${

            userType === 'college' ? 'ring-2 ring-orange-400 scale-105' : ''

          }`}

          onClick={() => setUserType(userType === 'college' ? null : 'college')}

        >

          <CardContent className="p-4 text-center">

            <BookOpen className="w-8 h-8 mx-auto mb-2 text-orange-400" />

            <h3 className="text-white font-semibold">College Students</h3>

            <p className="text-xs text-gray-400">Study groups & research</p>

            {userType === 'college' && <Badge className="mt-2 bg-orange-600">Active</Badge>}

          </CardContent>

        </Card>

      </div>



      {/* Specialized Content Based on User Type */}

      {userType && (

        <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-500">

          <CardHeader>

            <CardTitle className="text-white">

              {userType === 'k12' && 'ðŸŽ" K-12 Student Portal'}

              {userType === 'legal' && 'âš–ï¸ Legal Professional Suite'}

              {userType === 'medical' && 'ðŸ¥ Medical Research Hub'}

              {userType === 'college' && 'ðŸ"š College Student Center'}

            </CardTitle>

            <CardDescription className="text-gray-300">

              {userType === 'k12' && 'Interactive homework help, subject tutoring, and educational games'}

              {userType === 'legal' && 'Legal research, case law analysis, and document review tools'}

              {userType === 'medical' && 'Medical literature search, clinical trials, and peer collaboration'}

              {userType === 'college' && 'Study groups, research papers, thesis support, and career prep'}

            </CardDescription>

          </CardHeader>

         

          {/* CRITICAL JSX FIX: The content area uses grid-cols-3, ensuring the entire return uses a single structure */}

          <CardContent className="grid md:grid-cols-3 gap-4">

           

            {/* K-12 Features and Active View */}

            {userType === 'k12' && renderK12ActiveFeature()}





            {/* Legal Features */}

            {userType === 'legal' && (
              legalFeature === 'none' ? (
                <>
                  <Card className="bg-green-900/30 border border-green-700/50">
                    <CardContent className="p-4">
                      <h4 className="text-white font-semibold mb-1">Scenario Analyzer</h4>
                      <p className="text-sm text-gray-400 mb-3">Describe your situation — routes to the right Sovereign Toolkit with immediate action steps and standing assertions</p>
                      <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" onClick={() => setLegalFeature('scenario')}>Analyze My Situation</Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-900/30 border border-green-700/50">
                    <CardContent className="p-4">
                      <h4 className="text-white font-semibold mb-1">Counter-Canon</h4>
                      <p className="text-sm text-gray-400 mb-3">Look up any legal term — 7-part counter-definition: dominant use, embedded assumption, counter-definition, authority, application, truth, strategy</p>
                      <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" onClick={() => setLegalFeature('countercanon')}>Open Counter-Canon</Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-900/30 border border-green-700/50">
                    <CardContent className="p-4">
                      <h4 className="text-white font-semibold mb-1">Letter Generator</h4>
                      <p className="text-sm text-gray-400 mb-3">Court-ready letters: Debt Validation (§1692g), Credit Dispute (§1681), Cease &amp; Desist, Settlement Offer</p>
                      <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" onClick={() => setLegalFeature('letters')}>Generate Letter</Button>
                    </CardContent>
                  </Card>

                  <Card className="col-span-3 bg-slate-800/60 border border-slate-600 mt-1">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-semibold">Full Legal Defense Suite</h4>
                        <p className="text-sm text-gray-400">FDCPA/FCRA account tracking, debt analysis, USPS certified mail, settlement calculator, Badge of Slavery diagnostic — all 6 defense layers</p>
                      </div>
                      <a href="/app/legal-defense" className="shrink-0 ml-4">
                        <Button size="sm" className="bg-emerald-700 hover:bg-emerald-600 whitespace-nowrap">Open Full Suite</Button>
                      </a>
                    </CardContent>
                  </Card>
                </>
              ) : legalFeature === 'scenario' ? (
                <LegalScenarioAnalyzer onBack={() => setLegalFeature('none')} />
              ) : legalFeature === 'countercanon' ? (
                <LegalCounterCanon onBack={() => setLegalFeature('none')} />
              ) : (
                <LegalLetterGenerator onBack={() => setLegalFeature('none')} />
              )
            )}



            {/* Medical Features */}

            {userType === 'medical' && (

              <>

                <Card className="bg-purple-900/30">

                  <CardContent className="p-4">

                    <h4 className="text-white font-semibold mb-2">ðŸ"¬ PubMed Search</h4>

                    <p className="text-sm text-gray-400 mb-3">Search 35M+ biomedical literature citations</p>

                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => handleFeatureClick('pubmed')}>Search PubMed</Button>

                  </CardContent>

                </Card>

                <Card className="bg-purple-900/30">

                  <CardContent className="p-4">

                    <h4 className="text-white font-semibold mb-2">ðŸ§¬ Clinical Trials</h4>

                    <p className="text-sm text-gray-400 mb-3">Browse active trials and research studies</p>

                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => handleFeatureClick('trials')}>View Trials</Button>

                  </CardContent>

                </Card>

                <Card className="bg-purple-900/30">

                  <CardContent className="p-4">

                    <h4 className="text-white font-semibold mb-2">ðŸ'¥ Peer Network</h4>

                    <p className="text-sm text-gray-400 mb-3">Connect with medical professionals worldwide</p>

                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => handleFeatureClick('network')}>Join Network</Button>

                  </CardContent>

                </Card>

              </>

            )}



            {/* College Features */}

            {userType === 'college' && (

              <>

                <Card className="bg-orange-900/30">

                  <CardContent className="p-4">

                    <h4 className="text-white font-semibold mb-2">ðŸ'¥ Study Groups</h4>

                    <p className="text-sm text-gray-400 mb-3">Find or create study groups for your courses</p>

                    <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => handleJoinStudyGroup()}>Browse Groups</Button>

                  </CardContent>

                </Card>

                <Card className="bg-orange-900/30">

                  <CardContent className="p-4">

                    <h4 className="text-white font-semibold mb-2">ðŸ"– Research Papers</h4>

                    <p className="text-sm text-gray-400 mb-3">Access Google Scholar, JSTOR, IEEE Xplore</p>

                    <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => handleSearchPapers()}>Search Papers</Button>

                  </CardContent>

                </Card>

                <Card className="bg-orange-900/30">

                  <CardContent className="p-4">

                    <h4 className="text-white font-semibold mb-2">ðŸŽ¯ Career Prep</h4>

                    <p className="text-sm text-gray-400 mb-3">Resume building, interview prep, job search</p>

                    <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => handleFeatureClick('career')}>Get Started</Button>

                  </CardContent>

                </Card>

              </>

            )}

          </CardContent>

        </Card>

      )}



      <div className="grid lg:grid-cols-5 gap-6">

        {/* LEFT SIDE: Video, Collaboration, Document Management (3 columns = 60%) */}

        <div className="lg:col-span-3 space-y-6">

         

          {/* Video Chat & Collaboration */}

          <Card className="bg-slate-800/50 border-slate-600">

            <CardHeader>

              <CardTitle className="text-white flex items-center gap-2">

                <Video className="w-5 h-5" />

                Live Collaboration

                <Badge className="bg-red-600">BETA</Badge>

              </CardTitle>

            <CardDescription className="text-gray-400">

                1-on-1 video calls and scheduled study group sessions

              </CardDescription>

            </CardHeader>

            <CardContent className="space-y-4">

              <div className="flex justify-between items-center space-x-4">

                <Button

                  className={`flex-grow ${videoCallActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}

                  onClick={handleStartVideoCall}

                >

                  <Video className="w-4 h-4 mr-2" />

                  {videoCallActive ? 'End Video Call' : 'Start 1-on-1 Call'}

                </Button>

                <Button

                  variant="outline"

                  onClick={handleJoinStudyGroup}

                >

                  <Users className="w-4 h-4 mr-2" />

                  Join Study Group

                </Button>

              </div>

              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">

                <video

                  ref={videoRef}

                  autoPlay

                  playsInline

                  muted

                  className="w-full h-full object-cover"

                />

                {!videoCallActive && (

                  <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">

                    <p className="text-gray-500">Video Preview: Click "Start Call" to activate camera</p>

                  </div>

                )}

              </div>

            </CardContent>

          </Card>



          {/* Document Management */}

          <Card className="bg-slate-800/50 border-slate-600">

            <CardHeader>

              <CardTitle className="text-white flex items-center gap-2">

                <FileText className="w-5 h-5" />

                Document Hub

                <Badge className="bg-purple-600">Files</Badge>

              </CardTitle>

              <CardDescription className="text-gray-400">

                Upload, download, share, and collaboratively review documents

              </CardDescription>

            </CardHeader>

            <CardContent className="space-y-4">

              <div className="grid grid-cols-2 gap-3">

                <Button

                  className="bg-purple-600 hover:bg-purple-700"

                  onClick={handleUploadFiles}

                >

                  <Upload className="w-4 h-4 mr-2" />

                  Upload Files

                </Button>

                <Button

                  variant="outline"

                  onClick={handleShareDocument}

                >

                  <Share2 className="w-4 h-4 mr-2" />

                  Share Document

                </Button>

              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-400">Recent documents:</p>
                <p className="text-xs text-gray-600 italic">No documents uploaded yet. Use the Upload button to add files.</p>
              </div>

            </CardContent>

          </Card>

        </div>



        {/* RIGHT SIDE: AI Research Assistant (2 columns = 40%) */}

        <div className="lg:col-span-2">

          <Card className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border-emerald-500/50 sticky top-4 max-h-[calc(100vh-8rem)] flex flex-col">

            <CardHeader>

              <CardTitle className="text-white flex items-center gap-2">

                ðŸ¤– AI Study Assistant

                <Badge className="bg-emerald-600">Educational AI</Badge>

              </CardTitle>

              <CardDescription className="text-gray-400">

                Research help, homework assistance, document analysis

              </CardDescription>

            </CardHeader>

            <CardContent className="flex-1 overflow-hidden">

              <K12StudyAssistant />

            </CardContent>

          </Card>

        </div>

      </div>



      {/* Modals */}

      {userType && (

        <StudyGroupModal

          isOpen={showStudyGroupModal}

          onClose={() => setShowStudyGroupModal(false)}

          portalType={userType}

        />

      )}



      <FileUploadModal

        isOpen={showFileUploadModal}

        onClose={() => setShowFileUploadModal(false)}

      />



      {userType && (

        <AcademicSearchModal

          isOpen={showAcademicSearchModal}

          onClose={() => setShowAcademicSearchModal(false)}

          portalType={userType}

        />

      )}



      <DocumentReviewModal

        isOpen={showDocumentReviewModal}

        onClose={() => setShowDocumentReviewModal(false)}

      />

    </div>

  );

}