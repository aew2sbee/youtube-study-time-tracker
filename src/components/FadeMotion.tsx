'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyTime } from '@/hooks/useStudyTime';
import ProgressTable from './MyStudyProgress';

const SECTIONS = [ProgressTable()];
const SKIP_CONTENT_INDEX = [0, 1]

const SECTION_SWITCH_INTERVAL = 10 * 1000; // セクション切り替え間隔（ミリ秒）
const CONTENT_SWITCH_INTERVAL = 10 * 1000; // コンテンツ切り替え間隔（ミリ秒）

export default function FadeMotion() {
  const {
    users,
    nextUpdateTime,
    formatTime,
    formatUpdateTime,
    getTotalStudyTime,
    targetStudyTime,
    showProgressBar,
    personalProgress,
  } = useStudyTime();

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [userList, setUserList] = useState<string[]>([]);

  useEffect(() => {
    const userNames = users.map((user) => user.name);
    setUserList(userNames);
  }, [users]);

  useEffect(() => {
    const sectionInterval = setInterval(() => {
      setCurrentSectionIndex((prevIndex) => (prevIndex + 1) % SECTIONS.length);
      setCurrentContentIndex(0);
    }, SECTION_SWITCH_INTERVAL);

    return () => clearInterval(sectionInterval);
  }, []);

  useEffect(() => {
    const contentInterval = setInterval(() => {
      setCurrentContentIndex((prevIndex) => (prevIndex + 1) % userList.length);
    }, CONTENT_SWITCH_INTERVAL);

    return () => clearInterval(contentInterval);
  }, [currentSectionIndex, userList]);

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div
          key={`section-${currentSectionIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${currentSectionIndex}-${currentContentIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              {SKIP_CONTENT_INDEX.includes(currentSectionIndex) ? null : SECTIONS[currentContentIndex]}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
