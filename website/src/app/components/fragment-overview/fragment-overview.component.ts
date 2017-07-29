import { Component, OnInit } from '@angular/core';
import { FragmentService } from '../../services/fragment.service';

@Component({
  selector: 'app-fragment-overview',
  templateUrl: './fragment-overview.component.html',
  styleUrls: ['./fragment-overview.component.css']
})
export class FragmentOverviewComponent implements OnInit {

  fragments : Array<any>;
  constructor(private fragmentService: FragmentService){};

  ngOnInit() {
    console.log("!");
    this.fragmentService.all().subscribe(data => {
      console.log(data);
    })
  }

}

