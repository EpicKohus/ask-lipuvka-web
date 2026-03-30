import { useEffect, useMemo, useRef, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function AskLipuvkaWeb() {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isTrainersOpen, setIsTrainersOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const [isClubDropdownOpen, setIsClubDropdownOpen] = useState(false);
  const [isTeamsDropdownOpen, setIsTeamsDropdownOpen] = useState(false);
  const [isMobileTeamsDropdownOpen, setIsMobileTeamsDropdownOpen] = useState(false);
  const [isMobileClubDropdownOpen, setIsMobileClubDropdownOpen] = useState(false);
  const [clubPopupContent, setClubPopupContent] = useState(null);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [gallerySource, setGallerySource] = useState('global');
  const [showAllTeamAlbums, setShowAllTeamAlbums] = useState(false);

  const [activeCategory, setActiveCategory] = useState('mladsi-pripravka');
  const [visitCount, setVisitCount] = useState(null);

  const [firebaseNews, setFirebaseNews] = useState([]);
  const [firebaseMatches, setFirebaseMatches] = useState([]);
  const [firebaseGallery, setFirebaseGallery] = useState([]);

  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const todayStart = useMemo(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }, []);

  const categories = [
    {
      id: 'predpripravka',
      label: 'Předpřípravka',
      shortLabel: 'U7',
      image: '/tym-u7.jpg',
    },
    {
      id: 'mladsi-pripravka',
      label: 'Mladší přípravka',
      shortLabel: 'U9',
      image: '/tym-u9.jpg',
    },
    {
      id: 'starsi-pripravka',
      label: 'Starší přípravka',
      shortLabel: 'U11',
      image: '/tym-u11.jpg',
    },
  ];

  const partners = [
    {
      name: 'Revelop',
      logo: '/partneri/revelop.png',
      url: 'https://revelop.cz/',
      featured: true,
    },
    {
      name: 'DH',
      logo: '/partneri/dh.jpg',
      url: '',
      featured: true,
    },
  ];

  const newsItems = [
    {
      category: 'mladsi-pripravka',
      title: 'Otevření nové hospody na Zelený čtvrtek',
      text: 'Na Zelený čtvrtek, tedy 2. 4., bude na areálu otevřena nová hospoda. Na otvíračku bude připravené i zelené pivo.',
      date: '2. 