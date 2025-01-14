import { FaGithub } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import { BiCopyright } from 'react-icons/bi';

function Footer() {
  return (
    <footer className="w-full bg-gray-850 border-t border-gray-700 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          {/* Left side - Copyright and GitHub */}
          <div className="flex items-center text-sm text-gray-400">
            <div className="flex items-center gap-1.5">
              <BiCopyright className="w-3.5 h-3.5" />
              <span>{new Date().getFullYear()}</span>
            </div>
            <div className="mx-2 h-4 w-px bg-gray-700" />
            <a
              href="https://github.com/mahtab89"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-blue-400 transition-colors duration-200"
            >
              <FaGithub className="w-4 h-4" />
              <span>@mahtab89</span>
            </a>
          </div>

          {/* Right side - Links */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-400">
            <a
              href="https://api.hypixel.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-blue-400 transition-colors duration-200"
            >
              <span>API Docs</span>
              <FiExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://github.com/HypixelDev/PublicAPI/tree/master"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-blue-400 transition-colors duration-200"
            >
              <FaGithub className="w-4 h-4" />
              <span>Hypixel API</span>
            </a>

            <a
              href="https://github.com/mahtab89/hypixel-auction-notifier"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1 bg-gray-700/50 rounded-full hover:bg-gray-700 transition-colors duration-200"
            >
              <FaGithub className="w-4 h-4" />
              <span>Source</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 