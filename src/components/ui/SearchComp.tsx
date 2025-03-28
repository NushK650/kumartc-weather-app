import React from "react";

const SearchComp = () => {
    
      
  return (
    <div className="flex h-screen w-screen bg-gradient-to-t from-[#e7a005] to-[#F3D99F]">
      {/* Sidebar */}
      <div className="w-1/4 bg-[#e7a005] p-6">
        <h1 className="text-3xl font-bold mb-4">Favorites</h1>
        <div className="flex items-center justify-between bg-[#e7a005] p-2 rounded-full text-black border-1 border-black">
          <img src="/x.svg" alt="" />
          <p className="mr-30 font-bold">London UK</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center p-6">
        {/* Search Bar */}
        <div className="relative w-1/2 mb-6">
          <input
            type="text"
            placeholder="Search"
            className="w-full p-2 pl-4 pr-10 rounded-full  bg-white"
          />
          <img className="absolute right-3 top-2 center" src="/search.svg" />
        </div>

        {/* Weather Card */}
        <div className="bg-[#e7a005] p-8 rounded-lg w-[918px] h-[591px] text-black mt-20 mr-3">
          <div className="flex justify-between font-bold">
            <span className="flex items-center gap-5">
              <p className="text-6xl leading-none">+</p>
              <span className="leading-none">
                Added to <br /> Favorites
              </span>
            </span>
            <span className="ml-10 text-5xl">Sunny</span>
          
            <span className="text-center"><p className="text-5xl">STOCKTON</p>FRI Dec 6, 12:34</span>
          </div>

          <div className="text-center my-4">
            <span className="text-9xl font-bold">50°</span>
            <p className="text-4xl font-bold">H: 100 L: -100</p>
          </div>

          {/* Forecast */}
          <div className="flex justify-between mt-6 text-center">
            <div>
              <p>Sat</p>
            </div>
            <div>
              <p>Sun</p>
            </div>
            <div>
              <p>Mon</p>
            </div>
            <div>
              <p>Tue</p>
            </div>
            <div>
              <p>Wed</p>
            </div>
            <div>
              <p>Thu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchComp;
