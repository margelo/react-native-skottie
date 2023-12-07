/*
 * Copyright 2023 Google LLC
 *
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */
#ifndef RNSkTime_DEFINED
#define RNSkTime_DEFINED

/** \namespace SkTime
    Platform-implemented utilities to return a monotonic counter.
*/
namespace RNSkTime {

double GetNSecs();
inline double GetSecs() { return GetNSecs() * 1e-9; }
inline double GetMSecs() { return GetNSecs() * 1e-6; }

} // namespace SkTime

#endif
