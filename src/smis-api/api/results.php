<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "../db.php";

function resultsError($message, $status = 400) {
    http_response_code($status);
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode([
        "status" => false,
        "message" => $message
    ]);
    exit;
}

function pointsFromGrade($grade) {
    return match ((int) $grade) {
        1 => 1, 2 => 2, 3 => 3, 4 => 4,
        5 => 5, 6 => 6, 7 => 7, 8 => 8,
        default => 9
    };
}

$student_id = filter_input(INPUT_GET, 'student_id', FILTER_VALIDATE_INT);
if ($student_id === false || $student_id === null || $student_id < 1) {
    resultsError("A valid student_id is required");
}

$student_stmt = $db->prepare(
    "SELECT id, first, middle, last, form, gender, student_reg, school
     FROM students
     WHERE id = ? AND status = 'active'
     LIMIT 1"
);
$student_stmt->bind_param("i", $student_id);
$student_stmt->execute();
$student = $student_stmt->get_result()->fetch_assoc();
$student_stmt->close();

if (!$student) {
    resultsError("Student not found", 404);
}

$form = (int) $student['form'];
$school = $student['school'];

$school_stmt = $db->prepare("SELECT name, address, phone, motto FROM school_info WHERE school = ? LIMIT 1");
$school_stmt->bind_param("s", $school);
$school_stmt->execute();
$school_info = $school_stmt->get_result()->fetch_assoc() ?: [];
$school_stmt->close();

$bank_stmt = $db->prepare("SELECT account_name, bank, account_no, center, branch FROM banking WHERE school = ? LIMIT 1");
$bank_stmt->bind_param("s", $school);
$bank_stmt->execute();
$banking = $bank_stmt->get_result()->fetch_assoc() ?: [];
$bank_stmt->close();

$head_result = $db->query("SELECT username FROM staff WHERE role = 'head' LIMIT 1");
$head = $head_result ? ($head_result->fetch_assoc() ?: []) : [];

$academic_stmt = $db->prepare(
    "SELECT id, name, term, fees
     FROM academic_years
     WHERE status = 'active' AND school = ?
     LIMIT 1"
);
$academic_stmt->bind_param("s", $school);
$academic_stmt->execute();
$academic = $academic_stmt->get_result()->fetch_assoc();
$academic_stmt->close();

if (!$academic) {
    resultsError("No active academic year found for this school", 404);
}

$aca_id = (int) $academic['id'];

$students_stmt = $db->prepare(
    "SELECT id, first, middle, last, form, gender, student_reg
     FROM students
     WHERE form = ? AND school = ? AND status = 'active'
     ORDER BY last ASC, first ASC"
);
$students_stmt->bind_param("is", $form, $school);
$students_stmt->execute();
$students_result = $students_stmt->get_result();
$students = [];
while ($row = $students_result->fetch_assoc()) {
    $students[(int) $row['id']] = $row;
}
$students_stmt->close();

$subjects_result = $db->query(
    "SELECT id, name FROM subjects WHERE status = 'active' ORDER BY name ASC"
);
if (!$subjects_result) {
    resultsError("Could not load subjects", 500);
}

$subjects = [];
$english_id = null;
while ($row = $subjects_result->fetch_assoc()) {
    $subject_id = (int) $row['id'];
    $subjects[$subject_id] = $row['name'];
    if (strcasecmp(trim($row['name']), 'English') === 0) {
        $english_id = $subject_id;
    }
}

$marks_stmt = $db->prepare(
    "SELECT student, subject, final, grade, remark
     FROM marks
     WHERE form = ? AND aca_id = ?"
);
$marks_stmt->bind_param("ii", $form, $aca_id);
$marks_stmt->execute();
$marks_result = $marks_stmt->get_result();
$marks = [];
$subject_scores = [];
while ($row = $marks_result->fetch_assoc()) {
    $marks[(int) $row['student']][(int) $row['subject']] = $row;
    $subject_scores[(int) $row['subject']][(int) $row['student']] = (float) $row['final'];
}
$marks_stmt->close();

$subject_positions = [];
foreach ($subject_scores as $subject_id => $scores) {
    arsort($scores);
    $subject_rank = 1;
    $previous_score = null;
    $subject_index = 0;
    foreach ($scores as $class_student_id => $score) {
        $subject_index++;
        if ($previous_score !== null && $score !== $previous_score) {
            $subject_rank = $subject_index;
        }
        $subject_positions[$subject_id][$class_student_id] = $subject_rank;
        $previous_score = $score;
    }
}

$results = [];
foreach ($students as $id => $class_student) {
    $english_final = null;
    $english_points = null;
    $other_finals = [];
    $other_points = [];
    $pass_count = 0;

    foreach ($subjects as $subject_id => $subject_name) {
        if (!isset($marks[$id][$subject_id])) {
            continue;
        }

        $mark = $marks[$id][$subject_id];
        $final = (int) $mark['final'];
        $points = pointsFromGrade($mark['grade']);

        if ($final >= 40) {
            $pass_count++;
        }

        if ($subject_id === $english_id) {
            $english_final = $final;
            $english_points = $points;
        } else {
            $other_finals[] = $final;
            $other_points[] = $points;
        }
    }

    if ($form < 3) {
        rsort($other_finals);
        $best_six = array_slice(array_merge([$english_final ?? 0], $other_finals), 0, 6);
        while (count($best_six) < 6) {
            $best_six[] = 0;
        }
        $total = array_sum($best_six);
    } else {
        sort($other_points);
        $best_six = array_slice(array_merge([$english_points ?? 9], $other_points), 0, 6);
        while (count($best_six) < 6) {
            $best_six[] = 9;
        }
        $total = array_sum($best_six);
    }

    $results[$id] = [
        'student' => $class_student,
        'total' => $total,
        'remark' => ($pass_count >= 6 && $english_final !== null && $english_final >= 40) ? 'PASS' : 'FAIL'
    ];
}

if (!isset($results[$student_id])) {
    resultsError("Student result not found", 404);
}

uasort($results, function ($first, $second) use ($form) {
    return $form < 3
        ? $second['total'] <=> $first['total']
        : $first['total'] <=> $second['total'];
});

$rank = 1;
$previous_total = null;
$position = null;
$index = 0;
foreach ($results as $id => &$result) {
    $index++;
    if ($previous_total !== null && $result['total'] !== $previous_total) {
        $rank = $index;
    }
    $result['rank'] = $rank;
    if ((int) $id === $student_id) {
        $position = $rank;
    }
    $previous_total = $result['total'];
}
unset($result);

$student_result = $results[$student_id];
$total_label = $form < 3 ? 'TOTAL MARKS (BEST 6): ' : 'TOTAL POINTS (BEST 6): ';
$student_subjects = [];
$teacher_stmt = $db->prepare(
    "SELECT subject, username
     FROM subject_teachers st
     JOIN staff s ON st.teacher = s.id
     WHERE st.aca_id = ? AND st.form = ? AND st.school = ?"
);
$teacher_stmt->bind_param("iis", $aca_id, $form, $school);
$teacher_stmt->execute();
$teacher_result = $teacher_stmt->get_result();
$subject_teachers = [];
while ($row = $teacher_result->fetch_assoc()) {
    $subject_teachers[(int) $row['subject']] = $row['username'];
}
$teacher_stmt->close();

foreach ($subjects as $subject_id => $subject_name) {
    $mark = $marks[$student_id][$subject_id] ?? null;
    $student_subjects[] = [
        'subject' => $subject_name,
        'final' => $mark ? (int) $mark['final'] : null,
        'grade' => $mark ? $mark['grade'] : null,
        'position' => $subject_positions[$subject_id][$student_id] ?? null,
        'remark' => $mark ? $mark['remark'] : null,
        'teacher' => $subject_teachers[$subject_id] ?? null
    ];
}

$level = $form >= 3 ? 'senior' : 'junior';
$total = (int) $student_result['total'];
$teacher_comment_stmt = $db->prepare(
    "SELECT content FROM comments
     WHERE ? BETWEEN min_m AND max_m AND level = ? AND commenter = 'teacher'
     LIMIT 1"
);
$teacher_comment_stmt->bind_param("is", $total, $level);
$teacher_comment_stmt->execute();
$teacher_comment = $teacher_comment_stmt->get_result()->fetch_assoc()['content'] ?? 'Work harder.';
$teacher_comment_stmt->close();

$head_comment_stmt = $db->prepare(
    "SELECT content FROM comments
     WHERE ? BETWEEN min_m AND max_m AND level = ? AND commenter = 'head'
     LIMIT 1"
);
$head_comment_stmt->bind_param("is", $total, $level);
$head_comment_stmt->execute();
$head_comment = $head_comment_stmt->get_result()->fetch_assoc()['content'] ?? 'Fair performance.';
$head_comment_stmt->close();

if (strtolower($student['gender']) !== 'male') {
    $teacher_comment = preg_replace(['/\bHe\b/', '/\bhe\b/', '/\bHis\b/', '/\bhis\b/', '/\bHim\b/', '/\bhim\b/'], ['She', 'she', 'Her', 'her', 'Her', 'her'], $teacher_comment);
    $head_comment = preg_replace(['/\bHe\b/', '/\bhe\b/', '/\bHis\b/', '/\bhis\b/', '/\bHim\b/', '/\bhim\b/'], ['She', 'she', 'Her', 'her', 'Her', 'her'], $head_comment);
}

header("Content-Type: application/json; charset=UTF-8");
echo json_encode([
    'status' => true,
    'data' => [
        'student' => [
            'id' => (int) $student['id'],
            'name' => trim($student['first'] . ' ' . $student['middle'] . ' ' . $student['last']),
            'form' => $form,
            'gender' => $student['gender'],
            'student_reg' => $student['student_reg'],
            'school' => $school
        ],
        'academic' => [
            'id' => $aca_id,
            'name' => $academic['name'],
            'term' => $academic['term']
        ],
        'school' => [
            'name' => $school_info['name'] ?? null,
            'address' => $school_info['address'] ?? null,
            'phone' => $school_info['phone'] ?? null,
            'motto' => $school_info['motto'] ?? null
        ],
        'subjects' => $student_subjects,
        'remarks' => [
            'teacher' => $teacher_comment,
            'head' => $head_comment
        ],
        'headteacher' => $head['username'] ?? null,
        'banking' => [
            'account_name' => $banking['account_name'] ?? null,
            'bank' => $banking['bank'] ?? null,
            'account_no' => $banking['account_no'] ?? null,
            'center' => $banking['center'] ?? null,
            'branch' => $banking['branch'] ?? null
        ],
        'requirements' => [
            'fees' => $academic['fees'] ?? null,
            'items' => 'School uniform, Scientific Calculator, Mathematical Set, 30cm ruler.'
        ],
        'summary' => [
            'label' => $total_label,
            'total' => (int) $student_result['total'],
            'position' => (int) $position,
            'class_size' => count($results),
            'decision' => $student_result['remark']
        ]
    ]
]);
