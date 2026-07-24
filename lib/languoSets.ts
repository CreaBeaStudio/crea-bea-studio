// AUTO-GENERATED from Languo_Sortiment_0719_2.xlsx.
// Membership marked with either 'x' or 'X' in the source file -- both were
// treated identically (case usage has no discernible pattern).
//
// NORMALIZATION APPLIED: the source Code column has two rows written as
// "HC-608 (Gold)" and "HC-609 (Silver)" instead of plain codes -- stripped
// back to "HC-608"/"HC-609" here so they match lib/languo.ts's LANGUO_COLORS
// keys. Recommend fixing this directly in the source spreadsheet's Code
// column so future regenerations don't need this workaround.
//
// STILL OUTSTANDING as of this file (not fixed by the workaround above):
//   48 Set: 46 codes (expected 48 per the reference image -- missing BL-208, CB-902)
//   36 Set: 35 codes (expected 36 per the reference image -- missing BL-208)
// 240 Set / 96Set / 72 Set / 60 Set now match their expected counts exactly.
// All 24 named "color series" sets contain exactly 9 codes each, as expected.

export const LANGUO_SETS: Record<string, string[]> = {
    '288 Set': ['AG-171', 'AG-172', 'AG-173', 'AG-174', 'AG-175', 'AG-176', 'AG-177', 'AG-178', 'AG-179', 'AG-245', 'AG-246', 'AG-247', 'AG-248', 'AG-249', 'AG-250', 'AG-251', 'AG-252', 'AG-253', 'AG-254', 'AG-255', 'AG-256', 'BL-201', 'BL-202', 'BL-203', 'BL-204', 'BL-205', 'BL-206', 'BL-207', 'BL-208', 'BL-209', 'BL-210', 'BL-211', 'BL-212', 'BL-213', 'BL-214', 'BL-215', 'BL-257', 'BL-258', 'BL-259', 'BL-260', 'BL-261', 'BL-262', 'BL-263', 'BL-264', 'BL-265', 'BL-266', 'BL-267', 'BL-268', 'BR-701', 'BR-702', 'BR-703', 'BR-704', 'BR-705', 'BR-706', 'BR-707', 'BR-708', 'BR-709', 'BR-710', 'BR-711', 'BR-712', 'BR-713', 'BR-714', 'BR-715', 'CB-909', 'CB-901', 'CB-902', 'CB-903', 'CB-904', 'CB-905', 'CB-906', 'CB-907', 'CB-908', 'CB-910', 'CS-141', 'CS-142', 'CS-143', 'CS-144', 'CS-145', 'CS-146', 'CS-147', 'CS-148', 'CS-149', 'CS-501', 'CS-502', 'CS-503', 'CS-504', 'CS-505', 'CS-506', 'CS-507', 'CS-508', 'CS-509', 'CS-510', 'CS-511', 'DB-161', 'DB-1610', 'DB-1611', 'DB-1612', 'DB-162', 'DB-163', 'DB-164', 'DB-165', 'DB-166', 'DB-167', 'DB-168', 'DB-169', 'DS-181', 'DS-182', 'DS-183', 'DS-184', 'DS-185', 'DS-186', 'DS-187', 'DS-188', 'DS-189', 'GB-401', 'GB-402', 'GB-403', 'GB-404', 'GB-405', 'GB-406', 'GB-407', 'GB-408', 'GB-409', 'GB-410', 'GB-411', 'GB-412', 'GR-101', 'GR-1010', 'GR-1011', 'GR-1012', 'GR-1013', 'GR-102', 'GR-103', 'GR-104', 'GR-105', 'GR-106', 'GR-107', 'GR-108', 'GR-109', 'GR-110', 'GR-111', 'GR-112', 'GR-113', 'GR-114', 'GR-115', 'HC-131', 'HC-132', 'HC-133', 'HC-134', 'HC-135', 'HC-136', 'HC-137', 'HC-138', 'HC-139', 'HC-601', 'HC-602', 'HC-603', 'HC-604', 'HC-605', 'HC-606', 'HC-607', 'HC-608', 'HC-609', 'LC-111', 'LC-1110', 'LC-112', 'LC-113', 'LC-114', 'LC-115', 'LC-116', 'LC-117', 'LC-118', 'LC-119', 'LC-191', 'LC-192', 'LC-193', 'LC-194', 'LC-195', 'LC-196', 'LC-197', 'LC-198', 'LC-199', 'PC-233', 'PC-234', 'PC-235', 'PC-236', 'PC-237', 'PC-238', 'PC-239', 'PC-240', 'PC-241', 'PC-242', 'PC-243', 'PC-244', 'PC-801', 'PC-802', 'PC-803', 'PC-804', 'PC-805', 'PC-806', 'PC-807', 'PC-808', 'PC-809', 'PC-810', 'PC-811', 'PC-812', 'PC-813', 'PC-814', 'PC-815', 'PC-816', 'PC-817', 'PC-818', 'PU-301', 'PU-302', 'PU-303', 'PU-304', 'PU-305', 'PU-306', 'PU-307', 'PU-308', 'PU-309', 'PU-310', 'PU-311', 'PU-312', 'PU-313', 'PU-314', 'PU-315', 'PU-316', 'PU-317', 'PU-318', 'PU-319', 'PU-320', 'PU-321', 'RY-01', 'RY-02', 'RY-03', 'RY-04', 'RY-05', 'RY-06', 'RY-07', 'RY-08', 'RY-09', 'RY-10', 'RY-11', 'RY-12', 'RY-13', 'RY-14', 'RY-15', 'SG-151', 'SG-152', 'SG-153', 'SG-154', 'SG-155', 'SG-156', 'SG-157', 'SG-158', 'SG-159', 'SG-221', 'SG-222', 'SG-223', 'SG-224', 'SG-225', 'SG-226', 'SG-227', 'SG-228', 'SG-229', 'SG-230', 'SG-231', 'SG-232', 'YE-121', 'YE-1210', 'YE-1211', 'YE-1212', 'YE-122', 'YE-123', 'YE-124', 'YE-125', 'YE-126', 'YE-127', 'YE-128', 'YE-129', 'YE-130', 'YE-131', 'YE-132', 'YE-133', 'YE-134', 'YE-135', 'YE-136'],
    '240 Set': ['AG-171', 'AG-172', 'AG-173', 'AG-174', 'AG-175', 'AG-176', 'AG-177', 'AG-178', 'AG-179', 'BL-201', 'BL-202', 'BL-203', 'BL-204', 'BL-205', 'BL-206', 'BL-207', 'BL-208', 'BL-209', 'BL-210', 'BL-211', 'BL-212', 'BL-213', 'BL-214', 'BL-215', 'BR-701', 'BR-702', 'BR-703', 'BR-704', 'BR-705', 'BR-706', 'BR-707', 'BR-708', 'BR-709', 'BR-710', 'BR-711', 'BR-712', 'BR-713', 'BR-714', 'BR-715', 'CB-909', 'CB-901', 'CB-902', 'CB-903', 'CB-904', 'CB-905', 'CB-906', 'CB-907', 'CB-908', 'CB-910', 'CS-141', 'CS-142', 'CS-143', 'CS-144', 'CS-145', 'CS-146', 'CS-147', 'CS-148', 'CS-149', 'CS-501', 'CS-502', 'CS-503', 'CS-504', 'CS-505', 'CS-506', 'CS-507', 'CS-508', 'CS-509', 'CS-510', 'CS-511', 'DB-161', 'DB-1610', 'DB-1611', 'DB-1612', 'DB-162', 'DB-163', 'DB-164', 'DB-165', 'DB-166', 'DB-167', 'DB-168', 'DB-169', 'DS-181', 'DS-182', 'DS-183', 'DS-184', 'DS-185', 'DS-186', 'DS-187', 'DS-188', 'DS-189', 'GB-401', 'GB-402', 'GB-403', 'GB-404', 'GB-405', 'GB-406', 'GB-407', 'GB-408', 'GB-409', 'GB-410', 'GB-411', 'GB-412', 'GR-101', 'GR-1010', 'GR-1011', 'GR-1012', 'GR-1013', 'GR-102', 'GR-103', 'GR-104', 'GR-105', 'GR-106', 'GR-107', 'GR-108', 'GR-109', 'GR-110', 'GR-111', 'GR-112', 'GR-113', 'GR-114', 'GR-115', 'HC-131', 'HC-132', 'HC-133', 'HC-134', 'HC-135', 'HC-136', 'HC-137', 'HC-138', 'HC-139', 'HC-601', 'HC-602', 'HC-603', 'HC-604', 'HC-605', 'HC-606', 'HC-607', 'HC-608', 'HC-609', 'LC-111', 'LC-1110', 'LC-112', 'LC-113', 'LC-114', 'LC-115', 'LC-116', 'LC-117', 'LC-118', 'LC-119', 'LC-191', 'LC-192', 'LC-193', 'LC-194', 'LC-195', 'LC-196', 'LC-197', 'LC-198', 'LC-199', 'PC-801', 'PC-802', 'PC-803', 'PC-804', 'PC-805', 'PC-806', 'PC-807', 'PC-808', 'PC-809', 'PC-810', 'PC-811', 'PC-812', 'PC-813', 'PC-814', 'PC-815', 'PC-816', 'PC-817', 'PC-818', 'PU-301', 'PU-302', 'PU-303', 'PU-304', 'PU-305', 'PU-306', 'PU-307', 'PU-308', 'PU-309', 'PU-310', 'PU-311', 'PU-312', 'PU-313', 'PU-314', 'PU-315', 'PU-316', 'PU-317', 'PU-318', 'PU-319', 'PU-320', 'PU-321', 'RY-01', 'RY-02', 'RY-03', 'RY-04', 'RY-05', 'RY-06', 'RY-07', 'RY-08', 'RY-09', 'RY-10', 'RY-11', 'RY-12', 'RY-13', 'RY-14', 'RY-15', 'SG-151', 'SG-152', 'SG-153', 'SG-154', 'SG-155', 'SG-156', 'SG-157', 'SG-158', 'SG-159', 'YE-121', 'YE-1210', 'YE-1211', 'YE-1212', 'YE-122', 'YE-123', 'YE-124', 'YE-125', 'YE-126', 'YE-127', 'YE-128', 'YE-129', 'YE-130', 'YE-131', 'YE-132', 'YE-133', 'YE-134', 'YE-135', 'YE-136'],
    '192 Set': ['BL-201', 'BL-202', 'BL-203', 'BL-204', 'BL-205', 'BL-206', 'BL-207', 'BL-208', 'BL-209', 'BL-210', 'BL-211', 'BL-212', 'BL-213', 'BL-214', 'BR-701', 'BR-702', 'BR-703', 'BR-704', 'BR-705', 'BR-706', 'BR-707', 'BR-708', 'BR-709', 'BR-710', 'BR-711', 'BR-712', 'BR-713', 'BR-714', 'BR-715', 'CB-909', 'CB-901', 'CB-902', 'CB-903', 'CB-904', 'CB-905', 'CB-906', 'CB-907', 'CB-908', 'CB-910', 'CS-141', 'CS-142', 'CS-143', 'CS-144', 'CS-145', 'CS-146', 'CS-147', 'CS-148', 'CS-149', 'CS-501', 'CS-502', 'CS-503', 'CS-504', 'CS-505', 'CS-506', 'CS-507', 'CS-508', 'CS-509', 'CS-510', 'CS-511', 'DB-161', 'DB-162', 'DB-163', 'DB-164', 'DB-165', 'DB-166', 'DB-167', 'DB-168', 'DB-169', 'GB-401', 'GB-402', 'GB-403', 'GB-404', 'GB-405', 'GB-406', 'GB-407', 'GB-408', 'GB-409', 'GB-410', 'GB-411', 'GB-412', 'GR-101', 'GR-102', 'GR-103', 'GR-104', 'GR-105', 'GR-106', 'GR-107', 'GR-108', 'GR-109', 'GR-110', 'GR-111', 'GR-112', 'GR-113', 'GR-114', 'GR-115', 'HC-131', 'HC-132', 'HC-133', 'HC-134', 'HC-135', 'HC-136', 'HC-137', 'HC-138', 'HC-139', 'HC-601', 'HC-602', 'HC-603', 'HC-604', 'HC-605', 'HC-606', 'HC-607', 'HC-608', 'HC-609', 'LC-111', 'LC-112', 'LC-113', 'LC-114', 'LC-115', 'LC-116', 'LC-117', 'LC-118', 'LC-119', 'PC-801', 'PC-802', 'PC-803', 'PC-804', 'PC-805', 'PC-806', 'PC-807', 'PC-808', 'PC-809', 'PC-810', 'PC-811', 'PC-812', 'PC-813', 'PC-814', 'PC-815', 'PC-816', 'PU-301', 'PU-302', 'PU-303', 'PU-304', 'PU-305', 'PU-306', 'PU-307', 'PU-308', 'PU-309', 'PU-310', 'PU-311', 'PU-312', 'PU-313', 'PU-314', 'PU-315', 'RY-01', 'RY-02', 'RY-03', 'RY-04', 'RY-05', 'RY-06', 'RY-07', 'RY-08', 'RY-09', 'RY-10', 'RY-11', 'RY-12', 'RY-13', 'RY-14', 'SG-151', 'SG-152', 'SG-153', 'SG-154', 'SG-155', 'SG-156', 'SG-157', 'SG-158', 'SG-159', 'YE-121', 'YE-122', 'YE-123', 'YE-124', 'YE-125', 'YE-126', 'YE-127', 'YE-128', 'YE-129', 'YE-130', 'YE-131', 'YE-132', 'YE-133', 'YE-134', 'YE-135', 'YE-136'],
    '96Set': ['BL-201', 'BL-202', 'BL-203', 'BL-204', 'BL-205', 'BL-206', 'BL-207', 'BL-208', 'BL-209', 'BR-702', 'BR-704', 'BR-705', 'BR-706', 'BR-707', 'BR-709', 'CB-909', 'CB-901', 'CB-902', 'CB-903', 'CB-904', 'CB-905', 'CB-906', 'CB-908', 'CS-141', 'CS-143', 'CS-145', 'CS-147', 'CS-149', 'CS-501', 'CS-503', 'CS-506', 'CS-507', 'CS-508', 'CS-509', 'GB-401', 'GB-402', 'GB-403', 'GB-404', 'GB-405', 'GB-406', 'GR-101', 'GR-102', 'GR-103', 'GR-104', 'GR-105', 'GR-106', 'GR-107', 'GR-108', 'GR-109', 'HC-131', 'HC-134', 'HC-135', 'HC-136', 'HC-139', 'HC-603', 'HC-607', 'HC-608', 'HC-609', 'LC-111', 'LC-112', 'LC-113', 'LC-114', 'LC-116', 'LC-118', 'LC-119', 'PC-802', 'PC-804', 'PC-805', 'PC-806', 'PC-807', 'PC-809', 'PU-301', 'PU-302', 'PU-303', 'PU-304', 'PU-305', 'PU-306', 'PU-307', 'PU-308', 'RY-01', 'RY-02', 'RY-03', 'RY-04', 'RY-05', 'RY-06', 'RY-07', 'RY-08', 'RY-09', 'YE-121', 'YE-122', 'YE-124', 'YE-125', 'YE-126', 'YE-127', 'YE-128', 'YE-129'],
    '72 Set': ['BL-201', 'BL-202', 'BL-203', 'BL-204', 'BL-205', 'BL-206', 'BL-207', 'BL-208', 'BL-209', 'BR-702', 'BR-705', 'BR-706', 'CB-909', 'CB-902', 'CB-903', 'CB-904', 'CB-905', 'CB-906', 'CB-908', 'CS-143', 'CS-501', 'CS-503', 'CS-506', 'CS-507', 'CS-508', 'CS-509', 'GB-401', 'GB-403', 'GB-404', 'GB-405', 'GR-101', 'GR-103', 'GR-104', 'GR-105', 'GR-106', 'GR-107', 'GR-108', 'GR-109', 'HC-131', 'HC-134', 'HC-139', 'HC-603', 'HC-608', 'HC-609', 'LC-112', 'LC-113', 'LC-114', 'LC-116', 'LC-118', 'LC-119', 'PC-802', 'PC-805', 'PC-807', 'PC-809', 'PU-301', 'PU-302', 'PU-304', 'PU-305', 'PU-306', 'PU-308', 'RY-01', 'RY-02', 'RY-03', 'RY-04', 'RY-05', 'RY-06', 'RY-07', 'RY-09', 'YE-125', 'YE-126', 'YE-127', 'YE-129'],
    '60 Set': ['BL-201', 'BL-202', 'BL-203', 'BL-204', 'BL-205', 'BL-206', 'BL-208', 'BL-209', 'BR-702', 'BR-706', 'CB-909', 'CB-902', 'CB-904', 'CB-905', 'CB-906', 'CB-908', 'CS-143', 'CS-501', 'CS-503', 'CS-506', 'CS-507', 'CS-508', 'CS-509', 'GB-401', 'GB-403', 'GB-404', 'GB-405', 'GR-101', 'GR-103', 'GR-104', 'GR-105', 'GR-106', 'GR-108', 'GR-109', 'HC-139', 'HC-603', 'HC-608', 'HC-609', 'LC-112', 'LC-116', 'LC-118', 'LC-119', 'PC-802', 'PC-807', 'PU-302', 'PU-304', 'PU-305', 'PU-306', 'PU-308', 'RY-01', 'RY-02', 'RY-03', 'RY-05', 'RY-06', 'RY-07', 'RY-09', 'YE-125', 'YE-126', 'YE-127', 'YE-129'],
    '48 Set': ['BL-201', 'BL-202', 'BL-203', 'BL-204', 'BL-205', 'BL-206', 'BL-208','BL-209', 'BR-702', 'BR-706','CB-902','CB-906', 'CB-908', 'CS-143', 'CS-501', 'CS-503', 'CS-506', 'CS-507', 'CS-508', 'CS-509', 'GB-401', 'GB-403', 'GB-404', 'GB-405', 'GR-101', 'GR-103', 'GR-104', 'GR-105', 'GR-106', 'GR-108', 'GR-109', 'HC-139', 'HC-603', 'PC-802', 'PC-807', 'PU-302', 'PU-304', 'PU-305', 'PU-306', 'PU-308', 'RY-01', 'RY-02', 'RY-03', 'RY-05', 'RY-06', 'RY-07', 'RY-09', 'YE-126'],
    '36 Set': ['BL-202', 'BL-204', 'BL-205', 'BL-206', 'BL-208','BL-209', 'BR-702', 'BR-706', 'CB-906', 'CS-501', 'CS-503', 'CS-506', 'CS-507', 'CS-508', 'CS-509', 'GB-401', 'GB-403', 'GB-405', 'GR-101', 'GR-103', 'GR-104', 'GR-106', 'GR-108', 'GR-109', 'PC-802', 'PU-302', 'PU-304', 'PU-305', 'PU-306', 'PU-308', 'RY-01', 'RY-02', 'RY-03', 'RY-06', 'RY-07', 'YE-126'],
    '24 Set': ['BL-202', 'BL-204', 'BL-206', 'BL-209', 'BR-702', 'BR-706', 'CS-503', 'GB-401', 'GB-403', 'GB-405', 'GR-104', 'GR-106', 'GR-109', 'PC-802', 'PU-302', 'PU-304', 'PU-306', 'PU-308', 'RY-01', 'RY-02', 'RY-03', 'RY-06', 'RY-07', 'YE-126'],
    'Pink Series': ['PC-233', 'PC-235', 'PC-237', 'PC-238', 'PC-239', 'PC-240', 'PC-242', 'PC-243', 'PC-244'],
    'Blue Purple Series': ['BL-257', 'BL-259', 'BL-260', 'BL-261', 'BL-264', 'BL-265', 'BL-266', 'BL-267', 'BL-268'],
    'Cocoa Brown Series': ['AG-245', 'AG-246', 'AG-247', 'AG-248', 'AG-249', 'AG-250', 'AG-253', 'AG-254', 'AG-256'],
    'Forest Green Series': ['SG-221', 'SG-222', 'SG-224', 'SG-225', 'SG-226', 'SG-228', 'SG-230', 'SG-231', 'SG-232'],
    'Light Colors Series': ['LC-191', 'LC-192', 'LC-193', 'LC-194', 'LC-195', 'LC-196', 'LC-197', 'LC-198', 'LC-199'],
    'Dark Skin Series': ['DS-181', 'DS-182', 'DS-183', 'DS-184', 'DS-185', 'DS-186', 'DS-187', 'DS-188', 'DS-189'],
    'Advanced Grey Series': ['AG-171', 'AG-172', 'AG-173', 'AG-174', 'AG-175', 'AG-176', 'AG-177', 'AG-178', 'AG-179'],
    'Dusty Blue Series': ['DB-161', 'DB-162', 'DB-163', 'DB-164', 'DB-165', 'DB-166', 'DB-167', 'DB-168', 'DB-169'],
    'Sage Green Series': ['SG-151', 'SG-152', 'SG-153', 'SG-154', 'SG-155', 'SG-156', 'SG-157', 'SG-158', 'SG-159'],
    'Skin Tone Series B': ['CS-141', 'CS-142', 'CS-143', 'CS-144', 'CS-145', 'CS-146', 'CS-147', 'CS-148', 'CS-149'],
    'Dopamine Series B': ['HC-131', 'HC-132', 'HC-133', 'HC-134', 'HC-135', 'HC-136', 'HC-137', 'HC-138', 'HC-139'],
    'Warm Yellow Series': ['YE-121', 'YE-122', 'YE-123', 'YE-124', 'YE-125', 'YE-126', 'YE-127', 'YE-128', 'YE-129'],
    'Red Series': ['LC-111', 'LC-112', 'LC-113', 'LC-114', 'LC-115', 'LC-116', 'LC-117', 'LC-118', 'LC-119'],
    'Colourful Black Series': ['CB-909', 'CB-901', 'CB-902', 'CB-903', 'CB-904', 'CB-905', 'CB-906', 'CB-907', 'CB-908'],
    'Black Series': ['CB-909', 'CB-901', 'CB-902', 'CB-903', 'CB-904', 'CB-905', 'CB-906', 'CB-907', 'CB-908'],
    'Sweet Pink Series': ['PC-801', 'PC-802', 'PC-803', 'PC-804', 'PC-805', 'PC-806', 'PC-807', 'PC-808', 'PC-809'],
    'Maillard Series': ['BR-701', 'BR-702', 'BR-703', 'BR-704', 'BR-705', 'BR-706', 'BR-707', 'BR-708', 'BR-709'],
    'Dopamine Series A': ['HC-601', 'HC-602', 'HC-603', 'HC-604', 'HC-605', 'HC-606', 'HC-607', 'HC-608', 'HC-609'],
    'Skin Tone Series A': ['CS-501', 'CS-502', 'CS-503', 'CS-504', 'CS-505', 'CS-506', 'CS-507', 'CS-508', 'CS-509'],
    'Gray Brown Series': ['GB-401', 'GB-402', 'GB-403', 'GB-404', 'GB-405', 'GB-406', 'GB-407', 'GB-408', 'GB-409'],
    'Purple Series': ['PU-301', 'PU-302', 'PU-303', 'PU-304', 'PU-305', 'PU-306', 'PU-307', 'PU-308', 'PU-309'],
    'Blue Series': ['BL-201', 'BL-202', 'BL-203', 'BL-204', 'BL-205', 'BL-206', 'BL-207', 'BL-208', 'BL-209'],
    'Green Series': ['GR-101', 'GR-102', 'GR-103', 'GR-104', 'GR-105', 'GR-106', 'GR-107', 'GR-108', 'GR-109'],
    'Red/Yellow Series': ['RY-01', 'RY-02', 'RY-03', 'RY-04', 'RY-05', 'RY-06', 'RY-07', 'RY-08', 'RY-09'],
  };
  
  export const LANGUO_SET_OPTIONS = [
    { label: '288 Set (288 colors)', key: '288 Set' },
    { label: '240 Set (240 colors)', key: '240 Set' },
    { label: '192 Set (192 colors)', key: '192 Set' },
    { label: '96Set (96 colors)', key: '96Set' },
    { label: '72 Set (72 colors)', key: '72 Set' },
    { label: '60 Set (60 colors)', key: '60 Set' },
    { label: '48 Set (48 colors)', key: '48 Set' },
    { label: '36 Set (36 colors)', key: '36 Set' },
    { label: '24 Set (24 colors)', key: '24 Set' },
    { label: 'Pink Series (9 colors)', key: 'Pink Series' },
    { label: 'Blue Purple Series (9 colors)', key: 'Blue Purple Series' },
    { label: 'Cocoa Brown Series (9 colors)', key: 'Cocoa Brown Series' },
    { label: 'Forest Green Series (9 colors)', key: 'Forest Green Series' },
    { label: 'Light Colors Series (9 colors)', key: 'Light Colors Series' },
    { label: 'Dark Skin Series (9 colors)', key: 'Dark Skin Series' },
    { label: 'Advanced Grey Series (9 colors)', key: 'Advanced Grey Series' },
    { label: 'Dusty Blue Series (9 colors)', key: 'Dusty Blue Series' },
    { label: 'Sage Green Series (9 colors)', key: 'Sage Green Series' },
    { label: 'Skin Tone Series B (9 colors)', key: 'Skin Tone Series B' },
    { label: 'Dopamine Series B (9 colors)', key: 'Dopamine Series B' },
    { label: 'Warm Yellow Series (9 colors)', key: 'Warm Yellow Series' },
    { label: 'Red Series (9 colors)', key: 'Red Series' },
    { label: 'Colourful Black Series (9 colors)', key: 'Colourful Black Series' },
    { label: 'Black Series (9 colors)', key: 'Black Series' },
    { label: 'Sweet Pink Series (9 colors)', key: 'Sweet Pink Series' },
    { label: 'Maillard Series (9 colors)', key: 'Maillard Series' },
    { label: 'Dopamine Series A (9 colors)', key: 'Dopamine Series A' },
    { label: 'Skin Tone Series A (9 colors)', key: 'Skin Tone Series A' },
    { label: 'Gray Brown Series (9 colors)', key: 'Gray Brown Series' },
    { label: 'Purple Series (9 colors)', key: 'Purple Series' },
    { label: 'Blue Series (9 colors)', key: 'Blue Series' },
    { label: 'Green Series (9 colors)', key: 'Green Series' },
    { label: 'Red/Yellow Series (9 colors)', key: 'Red/Yellow Series' },
  ];
  
  