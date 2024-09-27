// import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IosShareIcon from '@mui/icons-material/IosShare';
import { Tooltip } from '@mui/material';

export default function BusinessList({ businessesData }: any) {
    const randomIndex = Math.floor(Math.random() * businessesData.length);
    const randomBusiness = businessesData[randomIndex];
    // console.log("random business: ", randomBusiness?.name);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: randomBusiness.name || 'Check this out!',
                    url: randomBusiness.url,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            alert('Sharing not supported on this browser.'); // Fallback
        }
    };

    return (
        <div className="z-20 container p-2">
            <div>
                {Array.isArray(businessesData) && businessesData.length > 0 ? (
                    <div className='text-white flex flex-col justify-center items-center'>
                        <Tooltip title={randomBusiness.url} arrow>
                            <a
                                href={randomBusiness.url}
                                className="hover:text-green-800 hover:underline transition duration-200"
                                rel="noreferrer noopener"
                                target="_blank"
                            >
                                <p className="font-semibold text-[24px] ">

                                    {randomBusiness.name}
                                </p>
                            </a>
                        </Tooltip>
                        {randomBusiness.image_url && (
                            <img
                                src={`${randomBusiness.image_url}`}
                                alt={`${randomBusiness.name} image`}
                                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                            />
                        )}
                        {randomBusiness.location && (
                            <div>
                                {randomBusiness.location.display_address.map((line: string, index: number) => (
                                    <p key={index}>
                                        {line}
                                    </p>
                                ))}
                            </div>
                        )}
                        <Tooltip title="Share" arrow>
                            <span className="cursor-pointer hover:text-blue-500 hover:scale-105 transition duration-300">
                                <IosShareIcon fontSize="small" onClick={handleShare} />
                                {/* <ContentCopyIcon fontSize="small" onClick={() => navigator.clipboard.writeText(randomBusiness.url)} /> */}
                            </span>
                        </Tooltip>
                    </div>
                ) : (
                    <div className='text-white'>No businesses found. Explore different search queries.</div>
                )}
            </div>
        </div>
    );
}
