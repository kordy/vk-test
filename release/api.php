<?php
	
	header("Content-type: application/json; charset=utf-8");
	header('Access-Control-Allow-Origin: *'); 
	header('Access-Control-Allow-Methods: GET, OPTIONS'); 
	
	if ($_SERVER['REQUEST_METHOD'] === 'GET') {
		$str = file_get_contents(__DIR__.'/assets/people.json');
		$items = json_decode($str, true);
		$result = [];
		foreach ($items as $item) {
			if (strpos($item['domain'], $_GET['value']) === 0) {
				$result[] = $item;
			}
		}

		echo json_encode($result);
	}
