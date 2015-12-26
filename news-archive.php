<?php

$news = array(
// add newest to the top!

    array(
        'date'      => 'Dec. 20, 2015',
        'version'   => '2.0.3b',
        'body' => array(
            'Fixed done links generating an "empy" GO TO line in textual export.',
        ),
    ),

    array(
        'date'      => 'Dec. 20, 2015',
        'version'   => '2.0.3',
        'body' => array(
            'Textual plan instructions moved to new "Export" panel in Planning tab.',
            'New Textual plan instruction format:<ul>'
            . '<li>tree structure: GO TO portal then actions to perform</li>'
            . '<li>GO TO line include time & distance from previous portal</li>'
            . '<li>GO TO can include short urls to portal (Intel) or location (Gmaps)</li>'
            . '</ul>'
            ,
        ),
    ),

    array(
        'date'      => 'Dec. 19, 2015',
        'version'   => '2.0.2c',
        'body' => array(
            'Fixed routes not showing in Visual preview due to OSRM protocol change',
        ),
    ),

    array(
        'date'      => 'Dec. 15, 2015',
        'version'   => '2.0.2b',
        'body' => array(
            'Fixed privacy settings not showing',
        ),
    ),

    array(
        'date'      => 'Dec. 15, 2015',
        'version'   => '2.0.2',
        'body' => array(
            'Improved gameworld changes detection (to avoid unnecessary plan analysis if nothing changed)',
            'Fixed autoscroll of Steps table when Plan Preview is not shown',
            '<em>Added this "news" section in Home tab</em>',
        ),
    ),
/*
    array(
        'date'      => 'Dec. 12, 2015',
        'version'   => '2.0.1',
        'body' => array(
            'Visual Preview: added alert for OSRM router down',
            'Fixed "copy plan" creating an empty plan',
            'Fixed "fake" portals out of map bounds not having all links & fields information and therefore removing them from gameworld',
        ),
    ),

    array(
        'date'      => 'Dec. 11, 2015',
        'version'   => '2.0b',
        'body' => array(
            'Fixed new (empty) plans not working at all',
        ),
    ),

    array(
        'date'      => 'Dec. 10, 2015',
        'title'     => 'v 2.0 online!',
        'body' =>
        $html->tag(
            'p',
            'Version 2, a brand new rewrite, is online!<br>Check the '
            . $html->link('video', 'https://youtu.be/f96PTPUh2lY', true)
            .'!'
        ),
    ),
*/
);
