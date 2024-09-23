
export default function BusinessList({ businessesData }: any) {
    return (
        <div className="mt-[200px] z-20 container">
            <h2 className="z-20 text-[24px] text-slate-500 font-semibold">
                Search results
            </h2>
            <div>
                {Array.isArray(businessesData) && businessesData.length > 0 ? (
                    businessesData.map((bus: any, index: number) => (
                        <div key={index} className='text-white'>
                            {bus.name} {/* Make sure bus.name exists */}
                        </div>
                    ))
                ) : (
                    <div className='text-white'>No businesses found.</div>
                )}
            </div>
        </div>
    );
}
