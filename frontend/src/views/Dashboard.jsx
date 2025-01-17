import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GitHubContributionGraph from '../components/GitHubContributionGraph';
import SettingsModal from '../components/Dashboard/Settings';
import LinkModal from '../components/Dashboard/LinkAccounts';
import NewBlogModal from '../components/Dashboard/NewBlogModal';
import axios from 'axios';


export default function Dashboard() {
    const { user, logout } = useContext(AuthContext)
    const navigate = useNavigate()
    const data = Array.from({ length: 365 }, () => Math.floor(Math.random() * 4));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
    const closeModal = () => {
        setIsModalOpen(false)
    }
    const closeLinkModal = () => {
        setIsLinkModalOpen(false)
    }
useEffect(()=>{
    getLeetcodeProfile("Raj77");
    getCodeforcesProfile("Vighnesh");
    getGeeksforGeeksProfile("atharvpatil73");
},[])
let initdata = {
    "profile" : { 
        "name":"",
        "username":"",
        "avatar":"",
        "ranking":0
    },
    "badges":{},
    "solved":{
        "totalsolved":0,
        "easy":0,
        "medium":0,
        "hard":0,
    },
    "contest":{
        "totalattended":0,
        "contestRating":0.0,
        "contestGlobalRanking":0
    }
}

const initCodeforcesData = {
    profile: {
        handle: "",
        avatar: "",
        maxRank: "",
        maxRating: 0,
        currentRating: "Unrated",
        rank: "Unranked"
    },
    contest: {
        contestsParticipated: 0,
        maxRating: 0,
        recentContest: "N/A",
        recentContestRank: "N/A",
        recentContests: []  // New field to store recent contests
    },
    solved: {
        totalSolved: 0,
        problemTags: {}
    }
};

const initGeeksforGeeksData = {
    profile: {
        username: '',
        avatar: 'default_avatar.png',
        instituteRank: 'N/A',
        score: 0,
    },
    solved: {
        totalSolved: 0,
        easy: 0,
        medium: 0,
        hard: 0,
    },
    currentStreak: [],
};


    const [leetcodedata, setLeetcodedata] = useState(initdata);
    const [codeforcesdata, setCodeforcesData] = useState(initCodeforcesData);
    const [geeksforGeeksData, setGeeksforGeeksData] = useState(initGeeksforGeeksData);

    async function getLeetcodeProfile(username) {
        try {
            const response = await axios.get(`https://alfa-leetcode-api.onrender.com/${username}`);
            const response2 = await axios.get(`https://alfa-leetcode-api.onrender.com/${username}/badges`);
            const response3 = await axios.get(`https://alfa-leetcode-api.onrender.com/${username}/solved`);
            const response4 = await axios.get(`https://alfa-leetcode-api.onrender.com/${username}/contest`);


            console.log('User Profile:', response.data);
            console.log('Badges:', response2.data);
            console.log('Solved:', response3.data);
            console.log('Contest:', response4.data);
            const profileData = response.data;
            const badgesData = response2.data;
            const solvedData = response3.data;
            const contestData = response4.data;
            
            const newleetcodedata = {
                "profile" : { 
                    "name":profileData.name,
                    "username":profileData.username,
                    "avatar":profileData.avatar,
                    "ranking":profileData.ranking
                },
                "badges":badgesData,
                "solved":{
                    "totalsolved":solvedData.solvedProblem,
                    "easy":solvedData.easySolved,
                    "medium":solvedData.mediumSolved,
                    "hard":solvedData.hardSolved,
                },
                "contest":{
                    "totalattended":contestData.contestAttend,
                    "contestRating":contestData.contestRating,
                    "contestGlobalRanking":contestData.contestGlobalRanking
                }
                }
            setLeetcodedata(newleetcodedata);
            
            
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    }


    async function getCodeforcesProfile(handle) {
        try {
            const [response, response2, response3] = await Promise.all([
                axios.get(`https://codeforces.com/api/user.info?handles=${handle}`),
                axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`),
                axios.get(`https://codeforces.com/api/user.status?handle=${handle}`)
            ]);

            const profileData = response.data.result[0];
            const ratingsData = response2.data.result;
            const solvedProblemsData = response3.data.result;

            // Get the last 5 contests or less
            const recentContests = ratingsData.slice(-5).map(contest => ({
                contestName: contest.contestName,
                rank: contest.rank,
                newRating: contest.newRating,
                oldRating: contest.oldRating,
                change: contest.newRating - contest.oldRating
            }));

            const newCodeforcesData = {
                profile: {
                    handle: profileData.handle,
                    avatar: profileData.avatar || 'default_avatar.png',
                    maxRank: profileData.maxRank,
                    maxRating: profileData.maxRating,
                    currentRating: profileData.rating || 'Unrated',
                    rank: profileData.rank || 'Unranked'
                },
                contest: {
                    contestsParticipated: ratingsData.length,
                    maxRating: Math.max(...ratingsData.map(contest => contest.newRating), 0),
                    recentContest: ratingsData[ratingsData.length - 1]?.contestName || 'N/A',
                    recentContestRank: ratingsData[ratingsData.length - 1]?.rank || 'N/A',
                    recentContests: recentContests
                },
                solved: {
                    totalSolved: solvedProblemsData.filter(problem => problem.verdict === 'OK').length,
                    problemTags: solvedProblemsData
                        .filter(problem => problem.verdict === 'OK')
                        .map(problem => problem.problem.tags)
                        .flat()
                        .reduce((acc, tag) => {
                            acc[tag] = (acc[tag] || 0) + 1;
                            return acc;
                        }, {})
                }
            };

            setCodeforcesData(newCodeforcesData);

        } catch (error) {
            console.error('Error fetching Codeforces profile:', error);
        }
    }

    async function getGeeksforGeeksProfile(username) {
        // try {
            // const requestOptions = {
            //     method: "GET",
            //     url: `https://geeks-for-geeks-api.vercel.app/atharvpatil73`
            // };
    
            // const response = await axios(requestOptions);
            // const profileData = response.data;
            
            // console.log('GeeksforGeeks Profile:', profileData);
            
            // const newGeeksforGeeksData = {
            //     profile: {
            //         username: profileData.info.userName,
            //         avatar: profileData.info.profilePicture || 'default_avatar.png',
            //         instituteRank: profileData.info.instituteRank || "N/A",
            //         score: profileData.info.codingScore || 0,
            //     },
            //     solved: {
            //         totalSolved: profileData.totalProblemsSolved,
            //         easy: profileData.solvedStats.easy.count,
            //         medium: profileData.solvedStats.medium.count,
            //         hard: profileData.solvedStats.hard.count,
            //     },
            //     currentStreak: profileData.currentStreak || [],
            // };
    
        //     setGeeksforGeeksData(newGeeksforGeeksData);
        // } catch (error) {
        //     console.error('Error fetching GeeksforGeeks profile:', error);
        // }
        console.log("GeeksforGeeks API is not working. Please check the API endpoint.");
        
        const requestOptions = {
            method: "GET",
            redirect: "follow"
          };
          
          fetch("https://geeks-for-geeks-api.vercel.app/atharvpatil73", requestOptions)
            .then((response) => response.text())
            .then((result) => console.log(result))
            .catch((error) => console.error(error));
    }

    if (user) return (
        <div className='w-full h-full'>
            {isModalOpen && <SettingsModal isOpen={isModalOpen} onRequestClose={closeModal} />}
            {isLinkModalOpen && <LinkModal isOpen={isLinkModalOpen} onRequestClose={closeLinkModal} />}
            {isBlogModalOpen && <NewBlogModal isOpen={isBlogModalOpen} onRequestClose={() => setIsBlogModalOpen(false)} />}

            <div className="flex flex-row pt-24 px-10 pb-4 mt-10">
                <div className="w-2/12 mr-6">
                    <div className="bg-[#0D1717] text-gray-500 rounded-xl gap-3 shadow-lg mb-6 px-6 py-4 flex flex-col items-center">
                        <img src={user?.profileUrl} className='rounded-md' alt="" srcSet="" />
                        <p className='text-sm text-gray-300 font-medium'>{user?.username}</p>
                        <p className='text-xs font-light -mt-3 text-gray-400'>{user?.email}</p>
                        <p className='text-xs font-light text-gray-400 text-wrap'>{user?.bio}</p>
                        {/* {console.log(user)} */}
                        <p className='text-md shadow-sm cursor-pointer w-full text-center bg-[#21302D] text-teal-100 p-1 px-4 rounded-lg'
                            onClick={() => setIsModalOpen(true)}

                        >Edit Profile</p>
                        <p className='text-md shadow-sm cursor-pointer w-full text-center bg-[#21302D] text-blue-100 p-1 px-4 rounded-lg'
                            onClick={() => setIsLinkModalOpen(true)}
                        >Link Account</p>
                        <p className='text-md shadow-sm cursor-pointer w-full text-center bg-[#21302D] text-yellow-100 p-1 px-4 rounded-lg'
                            onClick={() => setIsBlogModalOpen(true)}
                        >
                            New Blog
                        </p>
                        <p className='text-md shadow-sm cursor-pointer w-full text-center bg-[#21302D] text-red-100 p-1 px-4 rounded-lg'
                            onClick={() => {
                                logout()
                                navigate('/')
                            }}
                        >Logout
                        </p>

                    </div>

                    <div className="bg-[#0D1717] text-gray-500 rounded-xl shadow-lg mb-6 px-6 py-4">

                        <p className="inline-block  hover:text-gray-600 my-2 w-full">
                            Streak 0
                        </p>
                        <p className="inline-block  hover:text-gray-600 my-2 w-full">
                            Active Days 0
                        </p>
                        <p className="inline-block  hover:text-gray-600 my-2 w-full">
                            Longest Streak 0
                        </p>
                        <p className="inline-block  hover:text-gray-600 my-2 w-full">
                            Total Blogs 0
                        </p>
                        <p className="inline-block  hover:text-gray-600 my-2 w-full">
                            Profile Views 0
                        </p>
                    </div>
                </div>

                <div className="w-10/12">
                    <div className="flex flex-row">
                        <div className="bg-no-repeat bg-red-200 border border-red-300 rounded-xl w-7/12 mr-2 p-6" style={{ backgroundImage: "url(https://previews.dropbox.com/p/thumb/AAvyFru8elv-S19NMGkQcztLLpDd6Y6VVVMqKhwISfNEpqV59iR5sJaPD4VTrz8ExV7WU9ryYPIUW8Gk2JmEm03OLBE2zAeQ3i7sjFx80O-7skVlsmlm0qRT0n7z9t07jU_E9KafA9l4rz68MsaZPazbDKBdcvEEEQPPc3TmZDsIhes1U-Z0YsH0uc2RSqEb0b83A1GNRo86e-8TbEoNqyX0gxBG-14Tawn0sZWLo5Iv96X-x10kVauME-Mc9HGS5G4h_26P2oHhiZ3SEgj6jW0KlEnsh2H_yTego0grbhdcN1Yjd_rLpyHUt5XhXHJwoqyJ_ylwvZD9-dRLgi_fM_7j/p.png?fv_content=true&size_mode=5);", backgroundPosition: "90% center;" }}>
                            <p className="text-5xl text-indigo-900">Welcome <br /><strong>Lorem Ipsum</strong></p>
                            <span className="bg-red-300 text-xl text-white inline-block rounded-full mt-12 px-8 py-2"><strong>01:51</strong></span>
                        </div>

                        <div className="bg-no-repeat bg-orange-200 border border-orange-300 rounded-xl w-5/12 ml-2 p-6" style={{ backgroundImage: " url(https://previews.dropbox.com/p/thumb/AAuwpqWfUgs9aC5lRoM_f-yi7OPV4txbpW1makBEj5l21sDbEGYsrC9sb6bwUFXTSsekeka5xb7_IHCdyM4p9XCUaoUjpaTSlKK99S_k4L5PIspjqKkiWoaUYiAeQIdnaUvZJlgAGVUEJoy-1PA9i6Jj0GHQTrF_h9MVEnCyPQ-kg4_p7kZ8Yk0TMTL7XDx4jGJFkz75geOdOklKT3GqY9U9JtxxvRRyo1Un8hOObbWQBS1eYE-MowAI5rNqHCE_e-44yXKY6AKJocLPXz_U4xp87K4mVGehFKC6dgk_i5Ur7gspuD7gRBDvd0sanJ9Ybr_6s2hZhrpad-2WFwWqSNkh/p.png?fv_content=true&size_mode=5)", backgroundPosition: "100% 40%;" }}>
                            <p className="text-5xl text-indigo-900">Inbox <br /><strong>23</strong></p>
                            <a href="" className="bg-orange-300 text-xl text-white underline hover:no-underline inline-block rounded-full mt-12 px-8 py-2"><strong>See messages</strong></a>
                        </div>
                    </div>
                    <div className="flex flex-row h-64 text-sm font-semibold gap-4 mt-4">
                    <div className="bg-[#1a1a1a] rounded-xl shadow-lg p-4 w-4/12 text-white overflow-auto scrollbar-hide">
                    <h2 className="text-xl font-bold text-yellow-500 mb-3">Leetcode</h2>

                    {/* Profile Section with Badges Inline */}
                    <div className="flex gap-3 items-center mb-4">
                        <img src={leetcodedata?.profile?.avatar} alt="profileImage" className="w-12 h-12 rounded-full border-2 border-yellow-500 shadow-md" />
                        <div className="flex-1">
                            <p className="text-lg font-semibold">{leetcodedata?.profile?.username}</p>
                            <p className="text-gray-400 text-sm">Rank: {leetcodedata?.profile?.ranking}</p>
                        </div>
                        {/* Inline Badges */}
                        <div className="flex gap-2">
                            {leetcodedata?.badges?.badges?.slice(0, 4).map((badge, index) => (
                                <img key={index} src={badge.icon} alt={badge.name} className="w-10 h-10" title={badge.displayName} />
                            ))}
                        </div>
                    </div>

                    {/* Main Content: Pie Chart and Contest Stats Side by Side */}
                    <div className="flex gap-4 mt-2">

                        {/* Circular Chart with Total Solved and Difficulty Breakdown */}
                        <div className="flex flex-col items-center w-1/2 ">
                            <div className="relative w-24 h-24">
                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    <circle className="text-gray-700" strokeWidth="3" stroke="currentColor" fill="transparent" r="16" cx="18" cy="18" />
                                    <circle className="text-green-400" strokeWidth="3" strokeDasharray={`${(leetcodedata?.solved?.easy / leetcodedata?.solved?.totalsolved) * 100}, 100`} stroke="currentColor" fill="transparent" r="16" cx="18" cy="18" strokeDashoffset="0" />
                                    <circle className="text-yellow-400" strokeWidth="3" strokeDasharray={`${(leetcodedata?.solved?.medium / leetcodedata?.solved?.totalsolved) * 100}, 100`} stroke="currentColor" fill="transparent" r="16" cx="18" cy="18" strokeDashoffset={`-${(leetcodedata?.solved?.easy / leetcodedata?.solved?.totalsolved) * 100}`} />
                                    <circle className="text-red-400" strokeWidth="3" strokeDasharray={`${(leetcodedata?.solved?.hard / leetcodedata?.solved?.totalsolved) * 100}, 100`} stroke="currentColor" fill="transparent" r="16" cx="18" cy="18" strokeDashoffset={`-${((leetcodedata?.solved?.easy + leetcodedata?.solved?.medium) / leetcodedata?.solved?.totalsolved) * 100}`} />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                    <p className="font-bold text-xl">{leetcodedata?.solved?.totalsolved}</p>
                                    <p className="text-xs text-gray-400">Total Solved</p>
                                </div>
                            </div>
                            <div className="flex flex-wrpa gap-3 mt-2 text-xs">
                                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-400"></span><p>Easy</p></div>
                                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400"></span><p>Medium</p></div>
                                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400"></span><p>Hard</p></div>
                            </div>
                        </div>

                        {/* Contest Info Section */}
                        <div className="bg-[#222222] rounded-lg py-5 px-3 max-h-[150px] w-3/4 text-xs text-gray-300 shadow-md">
                            <p className="font-semibold text-lg text-yellow-500 mb-2">Contest Stats</p>
                            <div className="flex flex-col space-y-2 text-md">
                                <div className="flex justify-between items-center font-bold  ">
                                    <p>Total Attended</p>
                                    <span className="mx-1 text-yellow-500 ">{leetcodedata?.contest?.totalattended}</span>
                                </div>
                                <div className="flex justify-between items-center font-bold ">
                                    <p>Rating</p> 
                                    <span className=" mx-1  text-yellow-500">{leetcodedata?.contest?.contestRating}</span>
                                </div>
                                <div className="flex justify-between items-center font-bold ">
                                    <p>Global Rank</p>
                                    <span className=" mx-1 text-yellow-500">{leetcodedata?.contest?.contestGlobalRanking}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Custom CSS for scrollbar hide */}
                <style jsx>{`
                    .scrollbar-hide {
                        -ms-overflow-style: none; /* for Internet Explorer, Edge */
                        scrollbar-width: none; /* for Firefox */
                    }
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none; /* for Chrome, Safari, and Opera */
                    }
                `}</style>



                  {/* Codeforces Card */}
                    <div className="bg-[#1a1a1a] rounded-xl shadow-lg p-4 w-4/12 overflow-auto text-white scrollbar-hide">
                        <h2 className="text-2xl font-bold text-blue-500 mb-4">Codeforces</h2>

                        {/* Profile Section */}
                        <div className="flex gap-3 items-center mb-4">
                            <img src={codeforcesdata?.profile?.avatar} alt="profileImage" className="w-12 h-12 rounded-full shadow-md border-2 border-blue-500" />
                            <div>
                                <p className="text-lg font-semibold">{codeforcesdata?.profile?.handle}</p>
                                <p className="text-gray-400 text-sm">Rank: {codeforcesdata?.profile?.rank}</p>
                                <p className="text-gray-400 text-sm">Max Rating: {codeforcesdata?.profile?.maxRating}</p>
                            </div>
                        </div>


                        {/* Contest Stats */}
                        <div className="bg-[#222222] rounded-lg py-4 px-3 text-sm text-gray-300 shadow-md">
                            <p className="font-semibold text-lg text-blue-500 mb-2">Contest Stats</p>
                            <div className="flex flex-col space-y-2 text-md">
                                <div className="flex justify-between items-center font-bold">
                                    <p>Contests Participated</p>
                                    <span className="text-blue-500">{codeforcesdata?.contest?.contestsParticipated}</span>
                                </div>
                                <div className="flex justify-between items-center font-bold">
                                    <p>Recent Contest</p>
                                    <span className="text-blue-500">{codeforcesdata?.contest?.recentContest}</span>
                                </div>
                                <div className="flex justify-between items-center font-bold">
                                    <p>Recent Rank</p>
                                    <span className="text-blue-500">{codeforcesdata?.contest?.recentContestRank}</span>
                                </div>
                                <div className="flex justify-between items-center font-bold">
                                    <p>Max Rating</p>
                                    <span className="text-blue-500">{codeforcesdata?.contest?.maxRating}</span>
                                </div>
                            </div>
                        </div>

                        
                        {/* Total Solved Problems & Problem Tags */}
                        <div className="my-4">
                            <p className="text-lg font-semibold text-gray-300">Total Solved: <span className="text-blue-400">{codeforcesdata?.solved?.totalSolved}</span></p>
                            <p className="font-semibold text-gray-200 mb-2">Problem Tags:</p>
                            <div className="flex flex-wrap gap-2 text-sm">
                                {Object.entries(codeforcesdata?.solved?.problemTags || {}).map(([tag, count], index) => (
                                    <span key={index} className="bg-[#1e293b] text-blue-400 px-2 py-1 rounded-full shadow-sm">
                                        {tag} x{count}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Custom CSS for scrollbar hide */}
                    <style jsx>{`
                        .scrollbar-hide {
                            -ms-overflow-style: none; /* for Internet Explorer, Edge */
                            scrollbar-width: none; /* for Firefox */
                        }
                        .scrollbar-hide::-webkit-scrollbar {
                            display: none; /* for Chrome, Safari, and Opera */
                        }
                    `}</style>


                    {/* GeeksforGeeks Card */}
                        <div className="bg-[#1a1a1a] rounded-xl shadow-lg p-4 w-4/12 overflow-auto text-white">
                            <h2 className="text-2xl font-bold text-green-500 mb-4">GeeksforGeeks</h2>
                            
                            {/* Profile Section */}
                            <div className="flex gap-3 items-center mb-4">
                                <img src={geeksforGeeksData.profile.avatar} alt="GeeksforGeeks Avatar" className="w-12 h-12 rounded-full shadow-md border-2 border-green-500" />
                                <div>
                                    <p className="text-lg font-semibold">{geeksforGeeksData.profile.username}</p>
                                    <p className="text-gray-300">Institute Rank: <span className="text-green-400">{geeksforGeeksData.profile.instituteRank}</span></p>
                                    <p className="text-gray-300">Score: <span className="text-green-400">{geeksforGeeksData.profile.score}</span></p>
                                </div>
                            </div>
                            
                            {/* Solved Problems Section */}
                            <div className="mb-4">
                                <p className="text-lg font-semibold text-gray-300">Total Solved Problems: <span className="text-green-400">{geeksforGeeksData.solved.totalSolved}</span></p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="bg-[#2a2a2a] text-gray-200 px-2 py-1 rounded-lg shadow-sm">Easy: {geeksforGeeksData.solved.easy}</span>
                                    <span className="bg-[#2a2a2a] text-gray-200 px-2 py-1 rounded-lg shadow-sm">Medium: {geeksforGeeksData.solved.medium}</span>
                                    <span className="bg-[#2a2a2a] text-gray-200 px-2 py-1 rounded-lg shadow-sm">Hard: {geeksforGeeksData.solved.hard}</span>
                                </div>
                            </div>
                            
                            {/* Achievements Section */}
                            <div>
                                <p className="font-semibold text-gray-300">Achievements:</p>
                                <div className="flex gap-3 mt-2">
                                    {geeksforGeeksData.achievements?.length > 0 ? (
                                        geeksforGeeksData.achievements.map((achievement, index) => (
                                            <div key={index} className="group relative">
                                                <img src={achievement.icon} alt={achievement.name} className="w-8 h-8" />
                                                <p className="hidden group-hover:block absolute bottom-10 bg-black text-white px-2 py-1 rounded text-xs w-32 text-center">
                                                    {achievement.displayName}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400">No achievements available</p>
                                    )}
                                </div>
                            </div>
                        </div>

                </div>

                    <GitHubContributionGraph data={data} />

                </div>
            </div>
        </div>

    )
}
