/**
 * 디바운스 훅
 * 값이 변경된 후 지정된 delay(ms)가 지나야 debouncedValue가 업데이트됨
 * 검색 Input에서 불필요한 API 요청 방지에 사용
 */

import { useState, useEffect } from "react";

/**
 * 입력값을 지정된 딜레이만큼 지연시킨 값을 반환
 * @param value - 디바운스 처리할 원본 값
 * @param delay - 지연 시간 (밀리초)
 * @returns 지연된 값
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // delay ms 후에 debouncedValue 업데이트
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 값이 변경되면 이전 타이머 취소
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
