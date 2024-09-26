
export default function BusinessList({ businessesData }: any) {
    const randomIndex = Math.floor(Math.random() * businessesData.length);
    const randomBusiness = businessesData[randomIndex];
    console.log("random business: ", randomBusiness?.name);

    return (
        <div className="mt-[200px] z-20 container">
            <h2 className="z-20 text-[24px] text-slate-500 font-semibold">
                Search results
            </h2>
            <div>
                {Array.isArray(businessesData) && businessesData.length > 0 ? (
                    <div className='text-white'>
                        <a
                            href={`${randomBusiness.url}`}
                            className="hover:text-green-800 hover:underline transition duration-200 transform hover:scale-105"
                            rel="noreferrer noopener"
                            target="_blank"
                        >
                            {randomBusiness.name} {/* Ensure bus.name exists */}
                        </a>
                        {randomBusiness.image_url && (
                            <img
                                src={`${randomBusiness.image_url}`}
                                alt={`${randomBusiness.name} image`}
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            />
                        )}
                    </div>
                    // businessesData.map((bus: any, index: number) => (
                    //     <div key={index} className='text-white'>
                    //         <a
                    //             href={`${bus.url}`}
                    //             className="hover:text-green-800 hover:underline transition duration-200 transform hover:scale-105"
                    //             rel="noreferrer noopener"
                    //             target="_blank"
                    //         >
                    //             {bus.name} {/* Make sure bus.name exists */}
                    //         </a>
                    //         {bus.image_url && (
                    //             <img src={`${bus.image_url}`} alt={`${bus.name} image`}
                    //                 style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                    //         )}
                    //     </div>
                    // ))
                ) : (
                    <div className='text-white'>No businesses found.</div>
                )}
            </div>
        </div>
    );
}
