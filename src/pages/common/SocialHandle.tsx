import React from 'react';
import {
  BsFillHeartFill,
  BsGithub,
  BsLinkedin,
  BsTwitter,
} from 'react-icons/bs';

export default function SocialHandle() {
  return (
    <div className="flex flex-col space-y-4 items-center mt-6">
      <div className="flex space-x-2 items-center text-white">
        <div>Made with</div>
        <BsFillHeartFill color="red" />
        <div>
          by <strong>Sibi</strong>
        </div>
      </div>
      <div className="flex space-x-10">
        <a
          href="https://github.com/sibi-sharanyan"
          target="_blank"
          rel="noreferrer"
        >
          <BsGithub className="text-xl cursor-pointer text-white" />
        </a>

        <a
          href="https://www.linkedin.com/in/sibi-sharanyan"
          target="_blank"
          rel="noreferrer"
        >
          <BsLinkedin className="text-xl cursor-pointer text-white" />
        </a>
        <a
          href="https://twitter.com/sibi_sharanyan"
          target="_blank"
          rel="noreferrer"
        >
          <BsTwitter className="text-xl cursor-pointer text-white" />
        </a>
      </div>
      <a
        href="https://www.buymeacoffee.com/sibisharanyan"
        target="_blank"
        rel="noreferrer"
      >
        <img
          src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
          alt="Buy Me A Coffee"
          className="w-32 ml-1"
        />
      </a>
    </div>
  );
}
