import { Report } from './../../models/report';
import { ReportService } from './../../services/report.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { CommentService } from '../../services/comment.service';
import { Comment } from '../../models/comment';
import { ReportTag } from '../../models/report-tag';
import { ReportTagService } from '../../services/report-tag.service';
import { Reportcategory } from '../../models/reportcategory';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbCollapseModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent implements OnInit {
  reports: Report[] = [];
  newReport: Report = new Report();
  showUpdateForm: Report | null = null;
  editReport: Report | null = null;
  selected: Report | null = null;
  loggedInUser: User | null = null;
  newComment: Comment = new Comment();
  comments: Comment[] = [];
  isCollapsed = true;

  reportTags: ReportTag[] = [];
  reportCategory: Reportcategory | null = null;

  constructor(
    private reportService: ReportService,
    private authService: AuthService,
    private commentService: CommentService,
    private tagService: ReportTagService // private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.reload();
    this.getLoggedInUser();
    // this.loadCommentsToReport();
  }

  reload() {
     this.reportService.showAllEnabled().subscribe({
    // this.reportService.index().subscribe({
      next: (reports) => {
        this.reports = reports.sort((a, b) => {
          return (
            new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
          );
        });
        console.log(this.reports);
      },
      error: (err) => {
        console.error('Error loading reports: ', err);
      },
    });
  }

  deleteReport(reportId: number) {
    console.log(reportId);
    this.reportService.disableReport(reportId).subscribe({
      next: (result) => {
        this.reload();
        this.newReport = new Report();
      },
      error: (nojoy) => {
        console.error('Error deleting Report');
        console.error(nojoy);
      },
    });
  }

  displayLandingPage(): void {
    this.showUpdateForm = null;
  }

  displayUpdateForm(report: Report): void {
    this.selected = report;
    this.showUpdateForm = report;
    this.editReport = Object.assign({}, this.selected);
    this.reload();
    console.log(' currently in - displayUpdateForm()');
    console.log(this.selected);
    console.log('still in displayUpdateForm()');
  }

  updateReport(report: Report): void {
    this.reportService.update(report).subscribe({
      next: () => {
        this.selected = null;
        this.editReport = null;
        this.showUpdateForm = null;
        this.reload();
      },
      error: (error) => console.error('Error updating report:', error),
    });
  }

  setEditEvent(): void {
    if (this.showUpdateForm) {
      this.editReport = Object.assign({}, this.showUpdateForm);
    }
  }

  cancelEdit(): void {
    this.editReport;
  }

  isReportOwner(report: Report) {
    return report.user.id === this.loggedInUser?.id;
  }

  getLoggedInUser() {
    console.log('in report-buttons, reportOwner( ) .');
    let loggedInUser = this.authService.getLoggedInUser().subscribe({
      next: (loggedInUser) => {
        this.loggedInUser = loggedInUser;
      },
      error: (err) => {
        console.error('reportOwner() error: ');
        console.error(err);
      },
    });
  }

  loadCommentsToReport(reportId: number) {
    console.log('in loadCommentsToReport( ) .');
    this.commentService.showCommentsByReportId(reportId).subscribe({
      next: (comments) => {
        this.comments = comments;
        console.log(this.comments);
      },
      error: (err) => {
        console.error('Error loading comments: ', err);
      },
    });
  }

  loadTagsToReport(id: number) {
    console.log('in loadTagsToReport( ) .');
    this.tagService.showTagsByReportId(id).subscribe({
      next: (reportTags) => {
        this.reportTags = reportTags;
        console.log(this.reportTags);
      },
      error: (err) => {
        console.error('Error loading comments: ', err);
      },
    });
  }

  addComment(report: Report): void {
    this.newComment.report = report;
    console.log(this.newComment.report);
    this.commentService.create(this.newComment, report.id).subscribe({
      next: (createdComment) => {
        this.newComment = new Comment();
        this.reload();
        this.loadCommentsToReport(report.id);
      },
      error: (err) => {
        console.error('Error adding comment: ', err);
      },
    });
  }
}
